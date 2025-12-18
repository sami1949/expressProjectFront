import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import DarkModeToggle from '../components/common/DarkModeToggle';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import './Parametres.css';

const Parametres = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  return (
    <div className="accueil-page">
      <Navbar />
      
      <div className="accueil-container">
        <Sidebar />
        
        <main className="main-content">
          <div className="settings-page">
            <div className="container">
              <div className="settings-header">
                <h1>{t('settingsTitle')}</h1>
                <p>{t('settingsSubtitle')}</p>
              </div>

              <div className="settings-content">
                <div className="settings-section">
                  <h2>{t('appearance')}</h2>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('darkMode')}</h3>
                      <p>{t('darkModeDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <DarkModeToggle />
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h2>{t('language')}</h2>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('language')}</h3>
                      <p>{t('languageDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <div className="language-selector">
                        <button 
                          className={`language-btn ${language === 'fr' ? 'active' : ''}`}
                          onClick={() => handleLanguageChange('fr')}
                        >
                          {t('french')}
                        </button>
                        <button 
                          className={`language-btn ${language === 'en' ? 'active' : ''}`}
                          onClick={() => handleLanguageChange('en')}
                        >
                          {t('english')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h2>{t('settingsNotifications')}</h2>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('pushNotifications')}</h3>
                      <p>{t('pushNotificationsDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('emailNotifications')}</h3>
                      <p>{t('emailNotificationsDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h2>{t('privacy')}</h2>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('publicProfile')}</h3>
                      <p>{t('publicProfileDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('emailSearch')}</h3>
                      <p>{t('emailSearchDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Parametres;