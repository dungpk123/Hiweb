import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import i18n from '../../../i18n/config';
import { changeLanguage } from '../../../untils/i18n';
import { all_routes } from "../../../Router/all_routes";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";

const ForgotpasswordThree = () => {
  const { t } = useTranslation();
  const route = all_routes;

  // thay doi ngon ngu
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  }

  return (
    <div className="main-wrapper">
      {/* Khu vực chuyển đổi ngôn ngữ */}
      <div className="language-switcher-fixed">
        <div className="nav-item dropdown has-arrow flag-nav nav-item-box">
          <Link
            className="nav-link dropdown-toggle p-0"
            data-bs-toggle="dropdown"
            to="#"
            role="button"
          >
            <ImageWithBasePath
              src={`assets/img/flags/${i18n.language === 'vi' ? 'vn' : 'us'}.png`}
              alt="img"
              height={24}
              style={{ verticalAlign: 'middle', borderRadius: '4px', border: '1px solid #ccc' }} // Thêm viền nhẹ
            />
          </Link>
          <div className="dropdown-menu dropdown-menu-right">
            <Link
              to="#"
              className="dropdown-item"
              onClick={() => handleLanguageChange('vi')}
            >
              <ImageWithBasePath
                src="assets/img/flags/vn.png"
                alt="img"
                height={16}
              />
              &nbsp;Việt Nam
            </Link>
            <Link
              to="#"
              className="dropdown-item"
              onClick={() => handleLanguageChange('en')}
            >
              <ImageWithBasePath
                src="assets/img/flags/us.png"
                alt="img"
                height={16}
              />
              &nbsp;English
            </Link>
          </div>
        </div>
      </div>
      {/* end*/}
      <div className="account-content">
        <div className="login-wrapper login-new">
          <div className="container">
            <div className="login-content user-login">
              <div className="login-logo">
                <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt />
                </Link>
              </div>
              <form action="signin-3">
                <div className="login-userset">
                  <div className="login-userheading">
                    <h3>{t("forgotPassword.title")}</h3>
                    <h4>
                    {t("forgotPassword.description")}
                    </h4>
                  </div>
                  <div className="form-login">
                    <label>{t('forgotPassword.emailLabel')}</label>
                    <div className="form-addons">
                      <input type="email" className="form-control" placeholder={t('forgotPassword.emailPlaceholder')} />
                      <ImageWithBasePath
                        src="assets/img/icons/mail.svg"
                        alt="img"
                      />
                    </div>
                  </div>
                  <div className="form-login">
                    <Link to={route.signinthree} className="btn btn-login-v2">
                    {t('forgotPassword.buttonSubmit')}
                    </Link>
                  </div>
                  <div className="signinform text-center">
                    <h4>
                    {t('forgotPassword.backToLoginPrompt')}
                      <Link to={route.signinthree} className="hover-a">
                        {" "}
                        {t('forgotPassword.backToLoginLink')}{" "}
                      </Link>
                    </h4>
                  </div>
                  <div className="form-setlogin or-text">
                    <h4>{t("common.or")}</h4>
                  </div>
                  <div className="form-sociallink">
                    <ul className="d-flex justify-content-center">
                      <li>
                        <Link to="#" className="facebook-logo">
                          <ImageWithBasePath
                            src="assets/img/icons/facebook-logo.svg"
                            alt="Facebook"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link to="#">
                          <ImageWithBasePath
                            src="assets/img/icons/google.png"
                            alt="Google"
                          />
                        </Link>
                      </li>
                      <li>
                        <Link to="#" className="apple-logo">
                          <ImageWithBasePath
                            src="assets/img/icons/apple-logo.svg"
                            alt="Apple"
                          />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </form>
            </div>
            <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
              <p>Copyright © 2023 DreamsPOS. All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotpasswordThree;
