import { authenticatedRequest } from './auth.js'

const APPLICATIONS_PATH = '/applications'

export function listApplications() {
  return authenticatedRequest(APPLICATIONS_PATH)
}

export function getApplication(applicationId) {
  return authenticatedRequest(`${APPLICATIONS_PATH}/${encodeURIComponent(applicationId)}`)
}

export function createApplication({ name, url }) {
  return authenticatedRequest(APPLICATIONS_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url }),
  })
}

export function updateApplication(applicationId, changes) {
  const payload = {}
  if (changes.name !== undefined) payload.name = changes.name
  if (changes.url !== undefined) payload.url = changes.url
  if (changes.monitoringEnabled !== undefined) payload.monitoring_enabled = changes.monitoringEnabled

  return authenticatedRequest(`${APPLICATIONS_PATH}/${encodeURIComponent(applicationId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function disconnectApplication(applicationId) {
  return authenticatedRequest(`${APPLICATIONS_PATH}/${encodeURIComponent(applicationId)}/disconnect`, {
    method: 'POST',
  })
}

export function deleteApplication(applicationId) {
  return authenticatedRequest(`${APPLICATIONS_PATH}/${encodeURIComponent(applicationId)}`, {
    method: 'DELETE',
  })
}