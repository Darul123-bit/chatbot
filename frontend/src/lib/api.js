// RECUPERATION DE URL DU BACKEND
const BASE_URL = import.meta.env.VITE_API_BASE_URL


// CETTE FONCTION ENVOIE UN REQUETTE
export async function sendMessage(message, conversationId = null) {
    const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversation_id: conversationId }),
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Erreur backend (${res.status}) : ${text || res.statusText}`)
    }

    return res.json()
}