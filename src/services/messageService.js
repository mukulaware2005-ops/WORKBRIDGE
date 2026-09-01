
const API_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('workbridge_access_token')}`,
});

export async function listConversations() {
  const response = await fetch(`${API_URL}/conversations/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to load conversations: ${response.status}`);
  }

  return response.json();
}

export async function listMessages(conversationId) {
  const response = await fetch(
    `${API_URL}/messages/?conversation=${conversationId}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load messages: ${response.status}`);
  }

  return response.json();
}

export async function sendMessage(conversationId, text) {
  const response = await fetch(`${API_URL}/messages/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      conversation: conversationId,
      text,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || `Failed to send message: ${response.status}`
    );
  }

  return response.json();
}

export async function endConversation(conversationId) {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status: 'ended',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || `Failed to end conversation: ${response.status}`
    );
  }

  return response.json();
}

