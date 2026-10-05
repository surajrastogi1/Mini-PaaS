from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models.application import Application
from app.db.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["Applications"])


def get_owned_application(application_id: str, user: User, db: Session) -> Application:
	application = db.query(Application).filter(
		Application.id == application_id,
		Application.user_id == user.id,
	).first()
	if application is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
	return application


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
	payload: ApplicationCreate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	application = Application(
		user_id=current_user.id,
		name=payload.name.strip(),
		url=str(payload.url),
		monitoring_enabled=True,
	)
	db.add(application)
	db.commit()
	db.refresh(application)
	return application


@router.get("", response_model=list[ApplicationResponse])
def list_applications(
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	return db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.created_at.desc()).all()


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
	application_id: str,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	return get_owned_application(application_id, current_user, db)


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
	application_id: str,
	payload: ApplicationUpdate,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	application = get_owned_application(application_id, current_user, db)
	changes = payload.model_dump(exclude_unset=True)
	if "name" in changes and changes["name"] is not None:
		application.name = changes["name"].strip()
	if "url" in changes and changes["url"] is not None:
		application.url = str(changes["url"])
	if "monitoring_enabled" in changes and changes["monitoring_enabled"] is not None:
		application.monitoring_enabled = changes["monitoring_enabled"]

	db.commit()
	db.refresh(application)
	return application


@router.post("/{application_id}/disconnect", response_model=ApplicationResponse)
def disconnect_application(
	application_id: str,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	application = get_owned_application(application_id, current_user, db)
	application.monitoring_enabled = False
	db.commit()
	db.refresh(application)
	return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
	application_id: str,
	db: Session = Depends(get_db),
	current_user: User = Depends(get_current_user),
):
	application = get_owned_application(application_id, current_user, db)
	db.delete(application)
	db.commit()
	return Response(status_code=status.HTTP_204_NO_CONTENT)
