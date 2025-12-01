import i18n from '../i18n/config';

export const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Lưu vào localStorage (tự động bởi i18next-browser-languagedetector)
    localStorage.setItem('i18nextLng', lng);
  };
  
  export const getCurrentLanguage = () => {
    return i18n.language || 'vi';
  };
  
  export const isLanguage = (lng) => {
    return i18n.language === lng;
  };
