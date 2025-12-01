import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import i18n from "../../../i18n/config";
import { changeLanguage } from "../../../untils/i18n";
import { all_routes } from "../../../Router/all_routes";
import { setCurrentUser } from "../../../core/redux/action";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^(0|\+84)\d{9,10}$/;

const RegisterThree = () => {
  const { t } = useTranslation();
  const route = all_routes;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // thay doi ngon ngu
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

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

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // State quản lý lỗi cho từng trường
  const [formErrors, setFormErrors] = useState({});

  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const isValidEmail = (email) => EMAIL_REGEX.test(email);
  const isValidPhoneNumber = (phoneNumber) =>
    PHONE_NUMBER_REGEX.test(phoneNumber);

  useEffect(() => {
    const { password, confirmPassword } = formData;
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordMatchError(`${t("register.errorMismatchPassword")}`);
    } else {
      setPasswordMatchError("");
    }
    setError("");
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    setError("");
  };

  // Hàm kiểm tra lỗi khi người dùng (onBlur - input)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMessage = "";

    if (!value) {
      errorMessage = `${t("register.errorRequiredFields")}`;
    } else if (name === "email" && !isValidEmail(value)) {
      errorMessage = `${t("register.errorInvalidEmail")}`;
    } else if (name === "phoneNumber" && !isValidPhoneNumber(value)) {
      errorMessage = `${t("register.errorInvalidPhoneNumber")}`;
    }

    setFormErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const validateAllFields = () => {
    const {
      name,
      password,
      confirmPassword,
      firstName,
      lastName,
      email,
      phoneNumber,
    } = formData;
    let errors = {};
    let isValid = true;

    // Check input bắt buộc
    if (!name) {
      errors.name = `${t("register.errorRequiredFields")}`;
      isValid = false;
    }
    if (!firstName) {
      errors.firstName = `${t("register.errorRequiredFields")}`;
      isValid = false;
    }
    if (!lastName) {
      errors.lastName = `${t("register.errorRequiredFields")}`;
      isValid = false;
    }
    if (!password) {
      errors.password = `${t("register.errorRequiredFields")}`;
      isValid = false;
    }
    if (!confirmPassword) {
      errors.confirmPassword = `${t("register.errorRequiredFields")}`;
      isValid = false;
    }
    if (!email) {
      errors.email = `${t("register.errorRequiredFields")}`;
      isValid = false;
    } else if (!isValidEmail(email)) {
      errors.email = `${t("register.errorInvalidEmail")}`;
      isValid = false;
    }
    if (!phoneNumber) {
      errors.phoneNumber = `${t("register.errorRequiredFields")}`;
      isValid = false;
    } else if (!isValidPhoneNumber(phoneNumber)) {
      errors.phoneNumber = `${t("register.errorInvalidPhoneNumber")}`;
      isValid = false;
    }

    // Check nhập lại mk
    if (password !== confirmPassword) {
      errors.confirmPassword = `${t("register.errorMismatchPassword")}`;
      setPasswordMatchError(`${t("register.errorMismatchPassword")}`);
      isValid = false;
    } else {
      setPasswordMatchError("");
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      setError(`${t("register.errorRequiredFields")}`);
      return;
    }

    setLoading(true);

    const { name, password, firstName, lastName, email, phoneNumber } =
      formData;

    // Chuẩn bị payload API
    const apiPayload = {
      user_name: name,
      password: password,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      email: email,
    };

    const API_URL = `${import.meta.env.VITE_API_URL}/user/register`;

    try {
      const response = await axios.post(API_URL, apiPayload);

      if (response.data?.status === true && response.data?.code === 201) {
        showToast("success", `${t("register.successRegister")}`);
        const user = {
          username: apiPayload.user_name,
        };
        setTimeout(() => {
          dispatch(setCurrentUser(user));
          navigate(route.signinthree);
        }, 1200);
      } else {
        setError(response.data?.msg || `${t("register.errorRegisterFailed")}`);
        showToast(
          "error",
          `${t("register.errorGenericFailed")}: ${response.data?.msg}` ||
            `${t("register.errorRegisterFailed")}`
        );
      }
    } catch (err) {
      console.error(
        "Registration error:",
        err.response ? err.response.data : err.message
      );

      let errorMessage = `${t("register.errorRegisterFailed")}`;
      const errCode = err.response?.data?.err;
      const msgKey = err.response?.data?.msg;

      errorMessage = errCode
        ? `${errCode} ${t(msgKey)}`
        : msgKey
        ? t(msgKey)
        : t("error.networkError");

      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              }}
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
          <div className="login-content user-login">
            <div className="login-logo">
              <ImageWithBasePath src="assets/img/logo.png" alt="img" />
              <Link to={route.dashboard} className="login-logo logo-white">
                <ImageWithBasePath src="assets/img/logo-white.png" alt />
              </Link>
            </div>
            <form onSubmit={handleRegister}>
              <div className="login-userset">
                <div className="login-userheading">
                  <h3>{t("register.title")}</h3>
                  <h4>{t("register.welcome")}</h4>
                </div>

                {/* --- Name Input (user_name) --- */}
                <div className="form-login">
                  <label>{t("register.username")}</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder={t("register.usernamePlaceholder")}
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/user-icon.svg"
                      alt="img"
                    />
                  </div>
                  {formErrors.name && (
                    <div className="text-danger mt-1">{formErrors.name}</div>
                  )}
                </div>

                {/* --- First Name Input (first_name) --- */}
                <div className="form-login">
                  <label>{t("register.firstName")}</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      placeholder={t("register.firstNamePlaceholder")}
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/user-icon.svg"
                      alt="img"
                    />
                  </div>
                  {formErrors.firstName && (
                    <div className="text-danger mt-1">
                      {formErrors.firstName}
                    </div>
                  )}
                </div>

                {/* --- Last Name Input (last_name) --- */}
                <div className="form-login">
                  <label>{t("register.lastName")}</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      placeholder={t("register.lastNamePlaceholder")}
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/user-icon.svg"
                      alt="img"
                    />
                  </div>
                  {formErrors.lastName && (
                    <div className="text-danger mt-1">
                      {formErrors.lastName}
                    </div>
                  )}
                </div>

                {/* --- Email Input (email) --- */}
                <div className="form-login">
                  <label>{t("register.email")}</label>
                  <div className="form-addons">
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder={t("register.emailPlaceholder")}
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/mail.svg"
                      alt="img"
                    />
                  </div>
                  {formErrors.email && (
                    <div className="text-danger mt-1">{formErrors.email}</div>
                  )}
                </div>

                {/* --- Phone Number Input */}
                <div className="form-login">
                  <label>{t("register.phoneNumber")}</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      name="phoneNumber"
                      placeholder={t("register.phoneNumberPlaceholder")}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                  </div>
                  {formErrors.phoneNumber && (
                    <div className="text-danger mt-1">
                      {formErrors.phoneNumber}
                    </div>
                  )}
                </div>

                {/* --- Password Input --- */}
                <div className="form-login">
                  <label>{t("register.password")}</label>
                  <div className="pass-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="pass-input"
                      name="password"
                      placeholder={t("register.passwordPlaceholder")}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <span
                      className={`fas toggle-password ${
                        showPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                      onClick={togglePasswordVisibility}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  {formErrors.password && (
                    <div className="text-danger mt-1">
                      {formErrors.password}
                    </div>
                  )}
                </div>

                {/* --- Confirm Password Input --- */}
                <div className="form-login">
                  <label>{t("register.confirmPassword")}</label>
                  <div className="pass-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="pass-inputs"
                      name="confirmPassword"
                      placeholder={t("register.confirmPasswordPlaceholder")}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    />
                    <span
                      className={`fas toggle-passwords ${
                        showConfirmPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                      onClick={toggleConfirmPasswordVisibility}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  {passwordMatchError && (
                    <div className="text-danger mt-1">{passwordMatchError}</div>
                  )}
                  {formErrors.confirmPassword && !passwordMatchError && (
                    <div className="text-danger mt-1">
                      {formErrors.confirmPassword}
                    </div>
                  )}
                </div>

                {error && <div className="text-danger my-3">{error}</div>}

                {/* --- Terms & Privacy Checkbox --- */}
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-sm-8">
                      <div className="custom-control custom-checkbox justify-content-start">
                        <div className="custom-control custom-checkbox">
                          <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                            <input type="checkbox" required />
                            <span className="checkmarks" />
                            {t("register.agreeToTerms")}{" "}
                            <Link to="#" className="hover-a">
                              {t("register.privacyPolicy")}
                            </Link>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Sign Up Button --- */}
                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login-v2"
                    // Vô hiệu hóa nút nếu đang loading, có lỗi ..
                    disabled={
                      loading ||
                      passwordMatchError ||
                      Object.values(formErrors).some((err) => err)
                    }
                  >
                    {loading
                      ? `${t("register.loadingRegister")}`
                      : `${t("register.buttonSubmit")}`}
                  </button>
                </div>

                <div className="signinform">
                  <h4>
                    {t("register.hasAccountPrompt")}{" "}
                    <Link to={route.signinthree} className="hover-a">
                      {t("register.loginLink")}
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
            <p>Copyright © 2025 Hiweb.vn.</p>
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

export default RegisterThree;
