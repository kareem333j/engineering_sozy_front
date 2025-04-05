import React, { useState } from 'react';
import './auth.css';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logos/1.png';
import { useSnackbar } from 'notistack';
import CustomLinearProgress from '../progress/LinerProgress';
import axiosInstance from '../../Axios';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import { Helmet } from 'react-helmet';

export const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // snackbar
  const { enqueueSnackbar } = useSnackbar();
  const handleClickVariant = (msg, variant) => {
    enqueueSnackbar(msg, { variant, anchorOrigin: { vertical: "top", horizontal: "right" } });
  };

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    password2: "",
  });

  const [formErrors, setFormErrors] = useState({
    full_name: { error: false, msg: "" },
    email: { error: false, msg: "" },
    password: { error: false, msg: "" },
    password2: { error: false, msg: "" },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    formValidation();
  };

  const formValidation = () => {
    let errors = { full_name: {}, email: {}, password: {}, password2: {} };
    let isValid = true;

    if (formData.full_name.trim().length < 3) {
      errors.full_name = { error: true, msg: "الاسم بالكامل يجب أن يكون 3 أحرف على الأقل" };
      isValid = false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = { error: true, msg: "البريد الإلكتروني غير صالح" };
      isValid = false;
    }

    if (formData.password.length < 8) {
      errors.password = { error: true, msg: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
      isValid = false;
    }

    if (formData.password !== formData.password2) {
      errors.password2 = { error: true, msg: "كلمات المرور غير متطابقة" };
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (formValidation()) {
      sendForm();
    }
  };

  const sendForm = () => {
    setLoading(true);
    axiosInstance.post('/users/register/', formData)
      .then(() => {
        handleClickVariant('تم إنشاء الحساب بنجاح', 'success');
        navigate('/login');
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          const serverErrors = err.response.data;
          let newErrors = { full_name: {}, email: {}, password: {}, password2: {} };

          for (let key in serverErrors) {
            if (formErrors[key] !== undefined) {
              newErrors[key] = { error: true, msg: serverErrors[key][0] };
            }
          }
          setFormErrors(newErrors);
        }
        if (err.status === 400 || err.status === 401) {
          handleClickVariant('لم يتم إنشاء الحساب راجع بياناتك', 'error');
        } else {
          handleClickVariant('لقد حدث خطأ', 'error');
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Helmet>
        <title>Engineering Sozy | تسجيل حساب جديد</title>
      </Helmet>
      <CustomLinearProgress loading={loading} />
      <div className='register-page d-flex flex-column gap-0'>
        <img className='p-0' src={Logo} alt="App Logo" style={{ width: 150, marginTop: 5 }} />
        <h3 className='mb-5 fw-bold'>تسجيل حساب جديد</h3>
        <form onSubmit={submitForm} className="auth-form">
          {['full_name', 'email', 'password', 'password2'].map((field, index) => (
            <div key={index}>
              <div className="flex-column mb-2">
                <label>{field === 'full_name' ? 'الإسم بالكامل' : field === 'email' ? 'البريد الإلكتروني' : field === 'password' ? 'كلمة المرور' : 'تأكيد كلمة المرور'}</label>
              </div>
              <div className="inputForm mb-1">
                {
                  field === 'email' ? <AlternateEmailIcon /> :
                    (field === 'password' || field === 'password2') ? <HttpsOutlinedIcon /> :
                      <PersonOutlineOutlinedIcon />
                }
                <input
                  onChange={handleChange}
                  placeholder={field === 'full_name' ? 'ادخل اسمك' : field === 'email' ? 'ادخل البريد الإلكتروني' : 'ادخل كلمة المرور'}
                  className="input"
                  type={field.includes('password') ? 'password' : 'text'}
                  name={field}
                  value={formData[field]}
                />
              </div>
              {formErrors[field]?.error && <p className='text-danger'>{formErrors[field].msg}</p>}
            </div>
          ))}
          <button className="button-submit">إشتراك</button>
          <p className="p">امتلك حساب بالفعل؟ <span className="span"><Link to='/login'>تسجيل الدخول</Link></span></p>
        </form>
      </div>
    </>
  );
};
