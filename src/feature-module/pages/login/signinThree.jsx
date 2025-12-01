import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useTranslation } from "react-i18next";

import i18n from "../../../i18n/config";
import { changeLanguage } from "../../../untils/i18n";
import { setCurrentUser } from "../../../core/redux/action";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { all_routes } from "../../../Router/all_routes";
import ToastMessage from "../../components/ToastMessage/ToastMessage";

const SigninThree = () => {
  const route = all_routes;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // thay doi ngon ngu
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  // toast
  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });

    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 3000);
  };

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loginError, setLoginError] = useState("");

  const [formErrors, setFormErrors] = useState({
    userName: "",
    password: "",
  });

  const handleBlur = (field, value) => {
    let errorMessage = "";
    if (!value.trim()) {
      errorMessage = `${t("common.error.errorRequiredFields")}`;
    }
    // Cập nhật lỗi cho trường tương ứng
    setFormErrors((prev) => ({ ...prev, [field]: errorMessage }));
    // Xóa lỗi chung nếu có lỗi cụ thể được xử lý
    setLoginError("");
  };

  const validateAllFields = () => {
    let errors = {};
    let isValid = true;

    if (!userName.trim()) {
      errors.userName = `${t("common.error.errorRequiredFields")}`;
      isValid = false;
    }

    if (!password.trim()) {
      errors.password = `${t("common.error.errorRequiredFields")}`;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!validateAllFields()) {
      showToast("error", `${t("common.error.errorRequiredFields")}`);
      return;
    }

    try {
      const payload = {
        user_name: userName.trim(),
        password: password.trim(),
      };

      const API_URL = `${import.meta.env.VITE_API_URL}/user/login`;

      const response = await axios.post(API_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = response.data;

      if (data.code === 200) {
        showToast("success", `${t("login.successLogin")}`);

        setTimeout(() => {
          const token = data.Authorization;

          const userPayload = {
            username: userName,
            token: token,
          };

          dispatch(setCurrentUser(userPayload));
          localStorage.setItem("userToken", token);

          navigate(route.dashboard);
        }, 1200);
      } else {
        const errorMessage =
          data.Msg || `${t("login.errorInvalidCredentials")}`;
        showToast("error", `${t("login.errorLogin")}: ${errorMessage}`);
        setLoginError(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("error", `${t("login.errorLogin")}: ${error}`);

      if (error.response) {
        const apiError = error.response.data.Msg || `${t("login.errorSystem")}`;
        setLoginError(`${t("login.errorLogin")}: ${apiError}`);
      } else {
        setLoginError(`${t("login.errorApiConnection")}`);
      }
    }
  };

  const isFormInvalid =
    !!formErrors.userName || !!formErrors.password || !userName || !password;

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
              src={`assets/img/flags/${
                i18n.language === "vi" ? "vn" : "us"
              }.png`}
              alt="img"
              height={24}
              style={{
                verticalAlign: "middle",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }} // Thêm viền nhẹ
            />
          </Link>
          <div className="dropdown-menu dropdown-menu-right">
            <Link
              to="#"
              className="dropdown-item"
              onClick={() => handleLanguageChange("vi")}
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
              onClick={() => handleLanguageChange("en")}
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
              <form onSubmit={handleLogin}>
                <div className="login-userset">
                  <div className="login-userheading">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <h3>{t("login.title")}</h3>
                        <h4>{t("login.welcome")}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="form-login">
                    <label className="form-label">{t("login.username")}</label>
                    <div className="form-addons">
                      <input
                        type="text"
                        className="form-control"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onBlur={(e) => handleBlur("userName", e.target.value)}
                        placeholder={t("login.usernamePlaceholder")}
                      />
                      <ImageWithBasePath
                        src="assets/img/icons/mail.svg"
                        alt="img"
                      />
                    </div>
                    {formErrors.userName && (
                      <div className="text-danger mt-1 small">
                        {formErrors.userName}
                      </div>
                    )}
                  </div>
                  <div className="form-login">
                    <label>{t("login.password")}</label>
                    <div className="pass-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="pass-input form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={(e) => handleBlur("password", e.target.value)}
                        placeholder={t("login.passwordPlaceholder")}
                      />
                      <span
                        className={`fas toggle-password ${
                          showPassword ? "fa-eye" : "fa-eye-slash"
                        }`}
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                    {formErrors.password && (
                      <div className="text-danger mt-1 small">
                        {formErrors.password}
                      </div>
                    )}
                  </div>
                  {loginError && (
                    <div className="mb-3">
                      <span className="text-danger small">{loginError}</span>
                    </div>
                  )}
                  <div className="form-login authentication-check">
                    <div className="row">
                      <div className="col-6">
                        <div className="custom-control custom-checkbox">
                          <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                            <input type="checkbox" />
                            <span className="checkmarks" />
                            {t("login.rememberMe")}
                          </label>
                        </div>
                      </div>
                      <div className="col-6 text-end">
                        <Link
                          className="forgot-link"
                          to={route.forgotPasswordThree}
                        >
                          {t("login.forgotPassword")}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="form-login">
                    <button
                      type="submit"
                      className="btn btn-login-v2 w-100"
                      disabled={isFormInvalid}
                    >
                      {t("login.buttonSubmit")}
                    </button>
                  </div>
                  <div className="signinform">
                    <h4>
                      {t("login.noAccountPrompt")}
                      <Link to={route.registerThree} className="hover-a">
                        {" "}
                        {t("login.registerLink")}
                      </Link>
                    </h4>
                  </div>
                  <div className="form-setlogin or-text">
                    <h4>{t("common.or")}</h4>
                  </div>
                  <div className="form-sociallink">
                    <ul className="d-flex">
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
              <p>Copyright © 2025 HiWeb.vn</p>
            </div>
          </div>
        </div>
      </div>
      {toast.show && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default SigninThree;
