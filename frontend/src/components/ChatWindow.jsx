//  useState : la "mémoire" du composant (stocke des valeurs qui changent avec le temps)
//  useRef   : une "poignée" vers un élément HTML réel, snas redéclancher l'affichage
//  useEffect: exécute du code automatiquement quand certaines valeurs changent
import { useState, useRef, useEffect } from 'react'

//  La fonction écrite dans api.js, qui parle au backend FastAPI
import { sendMessage } from '../lib/api'


export default function ChatWindow() {
    /*  --- La mémoire du composant --- */

    //  Tableau de tous les messages échangés : { role: 'user' | 'assistant', content: '···' }
    const [messages, setMessage] = useState([])

    //  Ce que l'utilisateur est en train de taper dans le champ de saisie
    const [input, setInput] = useState('')

    //  true pendant qu'on attend la réponse du backend
    const [isLoading, setIsLoading] = useState(false)

    //  Message d'erreur si l'appel au backend échoue (null = pas d'erreur)
    const [error, setError] = useState(null)

    //  Id de conversation renvoyé par le backend, pour retrouver l'historique côté serveur
    const [conversationId, setConversationId] = useState(null)

    //  Poignée vers la zone qui contient les messages, pour pouvoir la faire défiler
    const scrollRef = useRef(null)

    /*  --- Défilement automatique ---  */


    /*  A chaque fois que "message" ou "isLoading" change, on fait glisser
    la zone de message tout en bas, pour toujours voir le dernier message
    */
    useEffect(() => {

        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        })

    }, [messages, isLoading])


   /*   --- Envoyer un message ---  */

    async function handleSubmit(e) {
        //  Empêche le formulaire de recharger la page (comportement HTML par défaut qu'on ne veut pas)
        e.preventDefault()

        //  On enlève les espaces inutiles au début/fin comme 'strip' en Python
        const text = input.trim()

        //  Si le champ est vide, ou si on attend déjà une réponse, on n'envoie rien
        if (!text || isLoading) return

        //  On construit le message de l'utilisateur et on l'ajoute à la liste existante
        //  (... prev = tous les messages précédents, on ne les efface pas)
        const userMessage = { role: 'user', content: text}
        setMessages((prev) => [...prev, userMessage])

        //  On vide le champ de saisie, on efface une éventuelle erreur précédente, et on affiche l'indicateur de chargement
        setInput('')
        setError(null)
        setIsLoading(true)

        try {
            //  On appelle le backend avec le message et l'id de conversation actuel
            const data = await sendMessage(text, conversationId)

            //  On ajoute la réponse du modèle à la liste des messages
            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])


            //  Si le backend a renvoyé un nouvel id de conversation, on le mémorise
            if (data.conversationId) setConversationId(data.conversationId)
        } catch (err) {
            //  Si l'appel échoue (serveur éteint, erreur réseau, etc..), on affiche un message d'erreur custom
            setError(err.message)
        } finally {
            //  Que ça ait marché ou pas, on arrête l'indicateur de chargement
            setIsLoading(false)
        }
    }

   /*   --- Envoyer avec la touche entrée ---    */

    function handleKeyDown(e) {
        //  Entrée seule = envoyer.Maj+Entrée = saut de ligne normal dans le textarea
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

   /*   --- Affichage (JSX) ---    */
    return (
        // Conteneur principal : occupe tout l'écran, fond sombre, texte clair
        <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
            {/* En-tête */}
            <header className="border-b border-slate-800 px-6 py-4">
                <h1 className="text-sm font-medium tracking-wide text-slate-400">
                    Chatbot <span className="text-teal-400">AI</span>
                </h1>
            </header>

            {/* Zone des messages, celle qui défile */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
                {/* Message d'accueil si aucune conversation n'a encore commencé */}
                {messages.length === 0 && (
                    <p className="mx-auto max-w-md pt-20 text-center text-sm text-slate-500">
                        Ecrire un message pour démarrer la conversation.
                    </p>
                )}

                <div className="mx-auto flex max-w-2xl flex-col gap-4">
                    {/* .map() transforme chaque message du tableau en une bulle affichée à l'écran */}
                    {messages.map((msg, i) => (
                        <div
                            key={i} // React a besoin d'un identifiant unique par élément de liste
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                                    msg.role === 'user'
                                    ? 'bg-teal-600 text-white'      // bulle utilisateur : à droite, colorée
                                    : 'bg-slate-800 text-slate-100'  // bulle assistant : à gauche, grise
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {/* Indicateur "en train d'écrire" pendant l'attente de la réponse */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="rounded-2xl bg-slate-800 px-4 py-2.5">
                                <span className="flex gap-1">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Affiche le message d'erreur seulement s'il y en a un */}
            {error && (
                <div className="mx-auto mb-2 max-w-2xl px-6 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Formulaire de saisie, en bas de l'écran */}
            <form onSubmit={handleSubmit} className="border-t border-slate-800 px-6 py-4">
                <div className="mx-auto flex max-w-2xl items-end gap-3">
                    <textarea
                        value={input} // le contenu est "contrôlé" par l'état React, pas par le navigateur
                        onChange={(e) => setInput(e.target.value)} // met à jour "input" à chaque frappe
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder="Écris ton message..."
                        className="flex-1 resize-none rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-500"
                    />
                    <button
                        type="submit"
                        // Bouton grisé si on attend déjà une réponse, ou si le champ est vide
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Envoyer
                    </button>
                </div>
            </form>
        </div>
    )
}
