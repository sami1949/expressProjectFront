import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translation dictionary
const translations = {
  fr: {
    // Navbar
    'home': 'Accueil',
    'friends': 'Amis',
    'messages': 'Messages',
    'notifications': 'Notifications',
    'profile': 'Profil',
    'groups': 'Groupes',
    'events': 'Événements',
    'photos': 'Photos',
    'navigation': 'Navigation',
    'shortcuts': 'Raccourcis',
    'myProfile': 'Mon Profil',
    'settings': 'Paramètres',
    'helpSupport': 'Aide & Support',
    'logout': 'Déconnexion',
    'searchPlaceholder': 'Rechercher sur Mini-Facebook...',
    
    // Settings page
    'settingsTitle': 'Paramètres',
    'settingsSubtitle': 'Gérez vos préférences et paramètres du compte',
    'appearance': 'Apparence',
    'darkMode': 'Mode Sombre',
    'darkModeDesc': 'Activez le mode sombre pour une expérience plus confortable dans des environnements peu éclairés',
    'settingsNotifications': 'Notifications',
    'pushNotifications': 'Notifications Push',
    'pushNotificationsDesc': 'Recevez des notifications en temps réel sur votre appareil',
    'emailNotifications': 'Emails de Notification',
    'emailNotificationsDesc': 'Recevez des emails pour les notifications importantes',
    'privacy': 'Confidentialité',
    'publicProfile': 'Profil Public',
    'publicProfileDesc': 'Rendez votre profil visible par tous les utilisateurs',
    'emailSearch': 'Recherche par Email',
    'emailSearchDesc': 'Autorisez les utilisateurs à vous trouver via votre adresse email',
    'language': 'Langue',
    'languageDesc': 'Changez la langue de l\'interface',
    'french': 'Français',
    'english': 'Anglais',
    
    // Accueil page
    'loadingPosts': 'Chargement des publications...',
    'loadMorePosts': 'Voir plus de publications',
    'loading': 'Chargement...',
    
    // Amis page
    'friendsAndSubscriptions': 'Amis & Abonnements',
    'suggestions': 'Suggestions',
    'followers': 'Abonnés',
    'subscriptions': 'Abonnements',
    'suggestedPeople': 'Personnes suggérées',
    'discoverNewPeople': 'Découvrez de nouvelles personnes à suivre',
    'searchSuggestions': 'Rechercher des suggestions...',
    'searchFollowers': 'Rechercher dans vos abonnés...',
    'searchSubscriptions': 'Rechercher dans vos abonnements...',
    'search': 'Rechercher',
    'searching': 'Recherche...',
    'reset': 'Réinitialiser',
    'loadingSuggestions': 'Chargement des suggestions...',
    'loadingFollowers': 'Chargement des abonnés...',
    'loadingSubscriptions': 'Chargement des abonnements...',
    'noSuggestionsAvailable': 'Aucune suggestion disponible',
    'noSuggestionsMessage': 'Nous n\'avons pas trouvé de nouvelles personnes à suggérer pour le moment.',
    'noFollowers': 'Aucun abonné',
    'noFollowersMessage': 'Vous n\'avez pas encore d\'abonnés. Partagez votre profil pour en avoir !',
    'noSubscriptions': 'Aucun abonnement',
    'noSubscriptionsMessage': 'Vous ne suivez personne pour le moment. Consultez les suggestions pour découvrir de nouvelles personnes !',
    'retry': 'Réessayer',
    'noBioAvailable': 'Aucune biographie disponible',
    'posts': 'posts',
    'following': 'Abonné',
    'follow': 'Suivre',
    'nowFollowing': 'Vous suivez maintenant {userName}',
    'unfollowed': 'Vous ne suivez plus {userName}',
    'errorLoadingData': 'Erreur lors du chargement des données',
    'errorLoadingFollowers': 'Erreur lors du chargement des abonnés',
    'errorLoadingFollowing': 'Erreur lors du chargement des abonnements',
    'errorLoadingSuggestions': 'Erreur lors du chargement des suggestions',
    'errorSearching': 'Erreur lors de la recherche',
    'errorFollowingAction': 'Erreur lors de l\'action',
    'apiConnectionSuccess': 'Connexion API réussie',
    'apiConnectionFailed': 'Échec de la connexion API',
    'apiConnectionError': 'Erreur de connexion API',
    
    // Messages page
    'noConversations': 'Aucune conversation',
    'selectConversationToStart': 'Sélectionnez une conversation pour commencer',
    'noMessagesStartConversation': 'Aucun message. Commencez la conversation!',
    'voiceMessage': 'Message vocal',
    'photo': 'Photo',
    'noMessage': 'Aucun message',
    'writeAMessage': 'Écrivez un message...',
    'attachImage': 'Joindre une image',
    'recordVoiceMessage': 'Enregistrer un message vocal',
    'stopRecording': 'Arrêter l\'enregistrement',
    'sendMessage': 'Envoyer le message',
    'messageSent': 'Message envoyé !',
    'errorSendingMessage': 'Erreur lors de l\'envoi du message',
    'errorLoadingUser': 'Impossible de charger l\'utilisateur',
    'errorLoadingConversations': 'Erreur lors du chargement des conversations',
    'errorLoadingMessages': 'Erreur lors du chargement des messages',
    'selectValidImage': 'Veuillez sélectionner une image valide (JPEG, PNG, etc.)',
    'imageSizeLimit': 'La taille de l\'image ne doit pas dépasser 5MB',
    'selectValidAudio': 'Veuillez sélectionner un fichier audio valide',
    'audioSizeLimit': 'La taille de l\'audio ne doit pas dépasser 10MB',
    'audioRecordedSuccessfully': 'Audio enregistré avec succès !',
    'errorConvertingAudio': 'Erreur lors de la conversion de l\'audio',
    'noAudioDataRecorded': 'Aucune donnée audio enregistrée. Veuillez réessayer.',
    'recordingInProgress': 'Enregistrement en cours...',
    'microphonePermissionDenied': 'Permission refusée. Veuillez autoriser l\'accès au microphone.',
    'noMicrophoneDetected': 'Aucun microphone détecté sur votre appareil.',
    'cannotAccessMicrophone': 'Impossible d\'accéder au microphone.',
    'recordingTooShort': 'Enregistrement trop court. Minimum 1 seconde.',
    'recordingCancelled': 'Enregistrement annulé',
    'voiceRecordingInProgress': 'Enregistrement vocal en cours...',
    'cancel': 'Annuler',
    'browserDoesNotSupportAudio': 'Votre navigateur ne supporte pas l\'élément audio.',
    'justNow': 'A l\'instant',
    'minutesAgo': 'Il y a {minutes} min',
    'hoursAgo': 'Il y a {hours}h',
    'daysAgo': 'Il y a {days}j',
    
    // Notifications page
    'markAllAsRead': 'Tout marquer comme lu',
    'deleteRead': 'Supprimer les lues',
    'all': 'Toutes',
    'unread': 'Non lues',
    'noNotifications': 'Aucune notification',
    'loadMore': 'Charger plus',
    'errorLoadingNotifications': 'Erreur lors du chargement des notifications',
    'errorMarkingAsRead': 'Erreur lors du marquage comme lu',
    'errorMarkingAllAsRead': 'Erreur lors du marquage de toutes les notifications',
    'errorDeletingNotification': 'Erreur lors de la suppression',
    'confirmDeleteReadNotifications': 'Voulez-vous vraiment supprimer toutes les notifications lues ?',
    'errorDeletingReadNotifications': 'Erreur lors de la suppression des notifications lues',
    'minutesAgoShort': 'Il y a {minutes} min',
    'hoursAgoShort': 'Il y a {hours} h',
    'daysAgoShort': 'Il y a {days} j',
    
    // Profile page
    'userNotFound': 'Utilisateur introuvable',
    'errorLoadingProfile': 'Erreur lors du chargement du profil',
    'imageTooLarge': 'L\'image est trop volumineuse. Veuillez choisir une image plus petite.',
    'profileUpdatedSuccessfully': 'Profil mis à jour avec succès',
    'errorUpdatingProfile': 'Erreur lors de la mise à jour du profil',
    'nowFollowingUser': 'Vous suivez maintenant cet utilisateur',
    'unfollowedUser': 'Vous ne suivez plus cet utilisateur',
    'loadingProfile': 'Chargement du profil...',
    'editProfile': 'Modifier le profil',
    'firstName': 'Prénom',
    'lastName': 'Nom',
    'bio': 'Bio',
    'talkAboutYourself': 'Parlez de vous...',
    'profilePicture': 'Photo de profil',
    'changePhoto': 'Changer la photo',
    'coverPhoto': 'Photo de couverture',
    'changeCoverPhoto': 'Changer la photo de couverture',
    'saveChanges': 'Enregistrer les modifications',
    'message': 'Message',
    'block': 'Bloquer',
    'unblock': 'Débloquer',
    'userBlockedSuccessfully': 'Utilisateur bloqué avec succès',
    'userUnblockedSuccessfully': 'Utilisateur débloqué avec succès',
    'errorBlockingUser': 'Erreur lors du blocage de l\'utilisateur',
    'blockedByUser': 'Bloqué par l\'utilisateur',
    'profileBlockedMessage': 'Profil bloqué',
    'youAreBlockedMessage': 'Vous ne pouvez pas accéder à ce profil car vous avez été bloqué par cet utilisateur.',
    'blockedUserPostsMessage': 'Vous ne pouvez pas voir les publications de cet utilisateur car vous l\'avez bloqué.',
    
    // Other common terms
    'save': 'Enregistrer',
    'cancel': 'Annuler',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'add': 'Ajouter'
  },
  en: {
    // Navbar
    'home': 'Home',
    'friends': 'Friends',
    'messages': 'Messages',
    'notifications': 'Notifications',
    'profile': 'Profile',
    'groups': 'Groups',
    'events': 'Events',
    'photos': 'Photos',
    'navigation': 'Navigation',
    'shortcuts': 'Shortcuts',
    'myProfile': 'My Profile',
    'settings': 'Settings',
    'helpSupport': 'Help & Support',
    'logout': 'Logout',
    'searchPlaceholder': 'Search on Mini-Facebook...',
    
    // Settings page
    'settingsTitle': 'Settings',
    'settingsSubtitle': 'Manage your account preferences and settings',
    'appearance': 'Appearance',
    'darkMode': 'Dark Mode',
    'darkModeDesc': 'Enable dark mode for a more comfortable experience in low light environments',
    'settingsNotifications': 'Notifications',
    'pushNotifications': 'Push Notifications',
    'pushNotificationsDesc': 'Receive real-time notifications on your device',
    'emailNotifications': 'Email Notifications',
    'emailNotificationsDesc': 'Receive emails for important notifications',
    'privacy': 'Privacy',
    'publicProfile': 'Public Profile',
    'publicProfileDesc': 'Make your profile visible to all users',
    'emailSearch': 'Email Search',
    'emailSearchDesc': 'Allow users to find you via your email address',
    'language': 'Language',
    'languageDesc': 'Change the interface language',
    'french': 'French',
    'english': 'English',
    
    // Accueil page
    'loadingPosts': 'Loading posts...',
    'loadMorePosts': 'Load more posts',
    'loading': 'Loading...',
    
    // Amis page
    'friendsAndSubscriptions': 'Friends & Subscriptions',
    'suggestions': 'Suggestions',
    'followers': 'Followers',
    'subscriptions': 'Subscriptions',
    'suggestedPeople': 'Suggested People',
    'discoverNewPeople': 'Discover new people to follow',
    'searchSuggestions': 'Search suggestions...',
    'searchFollowers': 'Search your followers...',
    'searchSubscriptions': 'Search your subscriptions...',
    'search': 'Search',
    'searching': 'Searching...',
    'reset': 'Reset',
    'loadingSuggestions': 'Loading suggestions...',
    'loadingFollowers': 'Loading followers...',
    'loadingSubscriptions': 'Loading subscriptions...',
    'noSuggestionsAvailable': 'No suggestions available',
    'noSuggestionsMessage': 'We haven\'t found any new people to suggest for now.',
    'noFollowers': 'No followers',
    'noFollowersMessage': 'You don\'t have any followers yet. Share your profile to get some!',
    'noSubscriptions': 'No subscriptions',
    'noSubscriptionsMessage': 'You\'re not following anyone yet. Check out suggestions to discover new people!',
    'retry': 'Retry',
    'noBioAvailable': 'No biography available',
    'posts': 'posts',
    'following': 'Following',
    'follow': 'Follow',
    'nowFollowing': 'You are now following {userName}',
    'unfollowed': 'You unfollowed {userName}',
    'errorLoadingData': 'Error loading data',
    'errorLoadingFollowers': 'Error loading followers',
    'errorLoadingFollowing': 'Error loading subscriptions',
    'errorLoadingSuggestions': 'Error loading suggestions',
    'errorSearching': 'Error searching',
    'errorFollowingAction': 'Error performing action',
    'apiConnectionSuccess': 'API connection successful',
    'apiConnectionFailed': 'API connection failed',
    'apiConnectionError': 'API connection error',
    
    // Messages page
    'noConversations': 'No conversations',
    'selectConversationToStart': 'Select a conversation to start',
    'noMessagesStartConversation': 'No messages. Start the conversation!',
    'voiceMessage': 'Voice message',
    'photo': 'Photo',
    'noMessage': 'No message',
    'writeAMessage': 'Write a message...',
    'attachImage': 'Attach an image',
    'recordVoiceMessage': 'Record a voice message',
    'stopRecording': 'Stop recording',
    'sendMessage': 'Send message',
    'messageSent': 'Message sent!',
    'errorSendingMessage': 'Error sending message',
    'errorLoadingUser': 'Unable to load user',
    'errorLoadingConversations': 'Error loading conversations',
    'errorLoadingMessages': 'Error loading messages',
    'selectValidImage': 'Please select a valid image (JPEG, PNG, etc.)',
    'imageSizeLimit': 'Image size must not exceed 5MB',
    'selectValidAudio': 'Please select a valid audio file',
    'audioSizeLimit': 'Audio size must not exceed 10MB',
    'audioRecordedSuccessfully': 'Audio recorded successfully!',
    'errorConvertingAudio': 'Error converting audio',
    'noAudioDataRecorded': 'No audio data recorded. Please try again.',
    'recordingInProgress': 'Recording in progress...',
    'microphonePermissionDenied': 'Permission denied. Please allow access to the microphone.',
    'noMicrophoneDetected': 'No microphone detected on your device.',
    'cannotAccessMicrophone': 'Cannot access microphone.',
    'recordingTooShort': 'Recording too short. Minimum 1 second.',
    'recordingCancelled': 'Recording cancelled',
    'voiceRecordingInProgress': 'Voice recording in progress...',
    'cancel': 'Cancel',
    'browserDoesNotSupportAudio': 'Your browser does not support the audio element.',
    'justNow': 'Just now',
    'minutesAgo': '{minutes} minutes ago',
    'hoursAgo': '{hours} hours ago',
    'daysAgo': '{days} days ago',
    
    // Notifications page
    'markAllAsRead': 'Mark all as read',
    'deleteRead': 'Delete read',
    'all': 'All',
    'unread': 'Unread',
    'noNotifications': 'No notifications',
    'loadMore': 'Load more',
    'errorLoadingNotifications': 'Error loading notifications',
    'errorMarkingAsRead': 'Error marking as read',
    'errorMarkingAllAsRead': 'Error marking all as read',
    'errorDeletingNotification': 'Error deleting notification',
    'confirmDeleteReadNotifications': 'Are you sure you want to delete all read notifications?',
    'errorDeletingReadNotifications': 'Error deleting read notifications',
    'minutesAgoShort': '{minutes} min ago',
    'hoursAgoShort': '{hours} h ago',
    'daysAgoShort': '{days} d ago',
    
    // Profile page
    'userNotFound': 'User not found',
    'errorLoadingProfile': 'Error loading profile',
    'imageTooLarge': 'The image is too large. Please choose a smaller image.',
    'profileUpdatedSuccessfully': 'Profile updated successfully',
    'errorUpdatingProfile': 'Error updating profile',
    'nowFollowingUser': 'You are now following this user',
    'unfollowedUser': 'You unfollowed this user',
    'loadingProfile': 'Loading profile...',
    'editProfile': 'Edit profile',
    'firstName': 'First name',
    'lastName': 'Last name',
    'bio': 'Bio',
    'talkAboutYourself': 'Talk about yourself...',
    'profilePicture': 'Profile picture',
    'changePhoto': 'Change photo',
    'coverPhoto': 'Cover photo',
    'changeCoverPhoto': 'Change cover photo',
    'saveChanges': 'Save changes',
    'message': 'Message',
    'block': 'Block',
    'unblock': 'Unblock',
    'userBlockedSuccessfully': 'User blocked successfully',
    'userUnblockedSuccessfully': 'User unblocked successfully',
    'errorBlockingUser': 'Error blocking user',
    'blockedByUser': 'Blocked by user',
    'profileBlockedMessage': 'Profile Blocked',
    'youAreBlockedMessage': 'You cannot access this profile because you have been blocked by this user.',
    'blockedUserPostsMessage': 'You cannot see this user\'s posts because you have blocked them.',
    
    // Other common terms
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');
  
  // Load language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);
  
  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  const t = (key) => {
    return translations[language]?.[key] || key;
  };
  
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};