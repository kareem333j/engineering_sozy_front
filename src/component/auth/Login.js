import React, { useEffect, useState } from 'react';
import './auth.css';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logos/1.png';
import axiosInstance from '../../Axios';
import { useSnackbar } from "notistack";
import CustomLinearProgress from '../progress/LinerProgress';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import { Helmet } from 'react-helmet';

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // snackbar
  const { enqueueSnackbar } = useSnackbar();
  const handleClickVariant = (msg, variant) => {
    enqueueSnackbar(msg, { variant, anchorOrigin: { vertical: "top", horizontal: "right" } });
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: { error: false, msg: "" },
    password: { error: false, msg: "" },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    })
  }

  const formValidation = () => {
    let errors = {
      email: { error: false, msg: "" },
      password: { error: false, msg: "" },
    };

    // check password
    if (formData.password.length <= 0) {
      errors.password = { error: true, msg: "كلمة المرور مطلوبة" };
    }

    // check email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email.length <= 0) {
      errors.email = { error: true, msg: "البريد الإلكتروني مطلوب" };
    } else if (!emailRegex.test(formData.email)) {
      errors.email = { error: true, msg: "بريد خطأ" };
    }

    setFormErrors(errors);

    if (!errors.email.error && !errors.password.error) {
      sendForm();
    }
  }

  const submitForm = (e) => {
    e.preventDefault();
    formValidation();
  }

  const sendForm = () => {
    setLoading(true);
    axiosInstance
      .post('/users/token/', {
        email: formData.email,
        password: formData.password,
      }).then((res) => {
        handleClickVariant('تم تسجيل الدخول بنجاح', 'success');
        navigate('/dashboard');
      })
      .catch((err) => {
        if (err.status === 401) {
          handleClickVariant('البريد الإلكتروني او كلمة المرور خطأ', 'error');
        } else if (err.status === 403) {
          handleClickVariant(err.response.data.error, 'error');
        } else {
          handleClickVariant('لقد حدث خطأ ما  ', 'error');
        }
      })
      .finally((() => setLoading(false)))
  }

  return (
    <>
      <Helmet>
        <title>Engineering Sozy | تسجيل الدخول</title>
      </Helmet>

      <CustomLinearProgress loading={loading} />
      <div className='login-page d-flex flex-column gap-0'>
        <img className='p-0' src={Logo} alt="App Logo" style={{ width: 150, marginTop: 5 }} />
        <h3 className='mb-5 fw-bold'>تسجيل الدخول</h3>
        <form onSubmit={submitForm} className="auth-form">
          <div className="flex-column">
            <label>البريد الإلكتروني </label></div>
          <div className="inputForm">
            <AlternateEmailIcon />
            <input
              onChange={handleChange}
              placeholder="ادخل البريد الإلكتروني"
              className="input"
              name='email'
              type="email"
              value={formData.email}
            />
          </div>
          {formErrors.email.error ? <p className='text-danger'>{formErrors.email.msg}</p> : null}

          <div className="flex-column">
            <label>كلمة المرور </label></div>
          <div className="inputForm">
            <HttpsOutlinedIcon />
            <input
              onChange={handleChange}
              placeholder="ادخل كلمة المرور"
              className="input"
              name='password'
              type="password"
              value={formData.password}
            />
          </div>
          {formErrors.password.error ? <p className='text-danger'>{formErrors.password.msg}</p> : null}

          <div className="flex-row">
            {/* <span className="span">نسيت كلمة المرور ؟</span> */}
          </div>
          <button className="button-submit">تسجيل</button>
          <p className="p">لا امتلك حساب <span className="span"><Link to='/register'>تسجيل حساب جديد</Link></span></p>
        </form>
      </div>
    </>
  )
}
