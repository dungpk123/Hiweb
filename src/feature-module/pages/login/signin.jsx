import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "../../../core/redux/action";

import { all_routes } from "../../../Router/all_routes";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";

const Signin = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const userList = useSelector((state) => state.userlist_data);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");

  // Kiểm tra định dạng email khi nhập
  const validateEmail = (value) => {
    setEmail(value);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      setEmailError("Email không hợp lệ. Vui lòng nhập đúng định dạng!");
    } else {
      setEmailError("");
    }
  };

   const handleLogin = (e) => {
    e.preventDefault();

    // Nếu email lỗi thì không xử lý tiếp
    if (emailError) return;

    const foundUser = userList.find(
      (user) => user.email === email && user.passwords === password
    );

    if (foundUser) {
      dispatch(setCurrentUser(foundUser));
      setLoginError(""); // Xóa lỗi cũ
      navigate(route.dashboard);
    } else {
      setLoginError("Email hoặc mật khẩu không đúng!");
    }
  };


  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper bg-img">
          <div className="login-content">
            <form onSubmit={handleLogin}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt="" />
                </Link>

                <div className="login-userheading">
                  <h3>Sign In</h3>
                  <h4>
                    Access the Dreamspos panel using your email and passcode.
                  </h4>
                </div>

                {/* Email */}
                <div className="form-login mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      className="form-control"
                      value={email}
                      onChange={(e) => validateEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                    <ImageWithBasePath
                      src="assets/img/icons/mail.svg"
                      alt="img"
                    />
                  </div>
                  {emailError && (
                    <span className="text-danger small">{emailError}</span>
                  )}
                </div>

                {/* Password */}
                <div className="form-login mb-3">
                  <label className="form-label">Password</label>
                  <div className="pass-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="pass-input form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    <span
                      className={`fas toggle-password ${
                        showPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="mb-3">
                    <span className="text-danger small">{loginError}</span>
                  </div>
                )}

                {/* Remember + Forgot */}
                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-12 d-flex align-items-center justify-content-between">
                      <div className="custom-control custom-checkbox">
                        <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                          <input type="checkbox" className="form-control" />
                          <span className="checkmarks" />
                          Remember me
                        </label>
                      </div>
                      <div className="text-end">
                        <Link className="forgot-link" to={route.forgotPassword}>
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="form-login">
                  <button type="submit" className="btn btn-login w-100">
                    Sign In
                  </button>
                </div>

                <div className="signinform">
                  <h4>
                    New on our platform?
                    <Link to={route.register} className="hover-a">
                      {" "}
                      Create an account
                    </Link>
                  </h4>
                </div>

                <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>

                {/* Social login */}
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
                  <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                    <p>Copyright © 2023 DreamsPOS. All rights reserved</p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
