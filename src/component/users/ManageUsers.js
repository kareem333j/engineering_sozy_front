import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axiosInstance from '../../Axios';
import { formatDate } from '../date-time/defaultDateFormat';
import DeleteIcon from '@mui/icons-material/Delete';
import { Avatar, Menu, MenuItem, TableFooter, TablePagination, Tooltip, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';
import Confirm from '../dialogs/DialogForm_1';
import { useSnackbar } from 'notistack';
import CustomLinearProgress from '../progress/LinerProgress';
import DefaultProgress from '../progress/Default';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { NoVideos } from '../no-data/NoVideos';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './users.css';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { EditAccount } from '../dialogs/EditAccount';
import { AuthContext } from '../../context/AuthContext';
import { Helmet } from 'react-helmet';


function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};



export default function ManageUsers() {
  const { user } = React.useContext(AuthContext);

  const [usersData, setUsersData] = React.useState([]);
  // pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - usersData.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [loading, setLoading] = React.useState(true);

  // snackbar
  const { enqueueSnackbar } = useSnackbar();

  const handleClickVariant = (msg, variant) => {
    enqueueSnackbar(msg, { variant, anchorOrigin: { vertical: "top", horizontal: "right" } });
  };

  const [loadingUpdate, setLoadingUpdate] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [clickedUser, setClickedUser] = React.useState(null);

  const deleteUser = async () => {
    setLoadingUpdate(true);
    try {
      const response = await axiosInstance.delete(`/users/profile/${clickedUser}/delete/`);
      if (response.status === 204) {
        handleClickVariant('تم حذف المستخدم بنجاح', 'success');
        getUsers();
      }
    } catch (error) {
      handleClickVariant('لقد حدث خطأ', 'error');
    } finally { setLoadingUpdate(false) }
  }

  const updateUser = async () => {
    const formData = new FormData();
    formData.append('is_superuser', JSON.stringify(isAdmin));
    formData.append('is_staff', JSON.stringify(isAssistant));
    formData.append('is_active', JSON.stringify(isActive));
    setLoadingUpdate(true);
    try {
      await axiosInstance.patch(`/users/profile/${clickedUser}/permissions/update/`, formData);
      handleClickVariant('تم تعديل صلاحيات الحساب بنجاح', 'success');
      getUsers();
      handleCloseForm();
    } catch (error) {
      handleClickVariant('لقد حدث خطأ', 'error');
    } finally { setLoadingUpdate(false) }
  }

  const getUsers = () => {
    setLoading(true);
    axiosInstance.get('/users/all')
      .then((response) => {
        setUsersData(response.data);
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }

  // edit user dialog
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isAssistant, setIsAssistant] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  const [openForm, setOpenForm] = React.useState(false);
  const handleOpenForm = (profile_id, is_superuser, is_staff, is_active) => {
    setClickedUser(profile_id);
    setOpenForm(true);
    setIsAdmin(is_superuser);
    setIsAssistant(is_staff);
    setIsActive(is_active);
  };
  const handleCloseForm = () => setOpenForm(false);

  React.useEffect(() => {
    getUsers();
  }, []);

  if (loading) {
    return <DefaultProgress sx={{ width: '100%', height: '70vh', display: 'flex' }} />
  }
  return (
    <>
      <Helmet>
        <title>Engineering Sozy | إدارة المستخدمين</title>
      </Helmet>
      <CustomLinearProgress loading={loadingUpdate} />
      {
        usersData.length > 0 ?
          <TableContainer className='table-container' component={Paper} dir='rtl' sx={{ width: '100%', overflowX: 'auto' }}>
            <Table aria-label="collapsible pagination table" sx={{ width: '100%', backgroundColor: 'var(--main-back3)' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--main-back)' }}>
                  <TableCell />
                  <TableCell />
                  <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap', display: 'flex', color: 'var(--main-blue-sky)' }}><span>ID</span></TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}><span>اسم المستخدم</span></TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}><span>حالة الحساب</span></TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}><span>ناريخ الإنضمام</span></TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}><span>اخر تسجيل دخول</span></TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}><span>رتبة الحساب</span></TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}><span>حالة التسجيل</span></TableCell>
                  <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}><span>عدد مرات التسجيل </span></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? usersData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : usersData
                ).map((row, i) => (
                  <TableRow key={i} sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: 'var(--main-back)' }} colSpan={9}>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} align="right">
                      {
                        user.user?.is_superuser ?
                          <>
                            <Tooltip title="المزيد"
                              id="demo-positioned-button"
                              aria-expanded={open ? 'true' : undefined}
                              onClick={handleClick}
                              aria-controls={open ? 'account-menu' : undefined}
                              aria-haspopup="true"
                            >
                              <IconButton aria-label="more">
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>

                            <Menu
                              anchorEl={anchorEl}
                              id="account-menu"
                              open={open}
                              onClose={handleClose}
                              onClick={handleClose}
                              slotProps={{
                                paper: {
                                  elevation: 0,
                                  sx: {
                                    boxShadow: '0px 1px 10px 1px var(--main-shadow)',
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    '& .MuiAvatar-root': {
                                      width: 32,
                                      height: 32,
                                      ml: -0.5,
                                      mr: 1,
                                    },
                                    '&::before': {
                                      content: '""',
                                      display: 'block',
                                      position: 'absolute',
                                      top: 0,
                                      right: 14,
                                      width: 10,
                                      height: 10,
                                      bgcolor: 'background.paper',
                                      transform: 'translateY(-50%) rotate(45deg)',
                                      zIndex: 0,
                                    },
                                  },
                                },
                              }}
                              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                              <MenuItem onClick={(e) => {
                                handleClose();
                                setClickedUser(row.profile.profile_id); // إضافة هذا السطر
                                handleOpenForm(row.profile.profile_id, row.is_superuser, row.is_staff, row.profile.is_active);
                              }} className='d-flex gap-3 justify-content-end'>
                                تعديل صلاحيات
                                <EditIcon />
                              </MenuItem>

                              <MenuItem onClick={() => {
                                handleClose();
                                setOpenAlert(true);
                                setClickedUser(row.profile.profile_id);
                              }} className='d-flex gap-3 justify-content-end'>
                                حذف الحساب
                                <DeleteIcon />
                              </MenuItem>
                            </Menu>
                          </>
                          : ''
                      }


                      <Tooltip component={Link} to={`/profile/${row.profile.profile_id}`} title="زيارة">
                        <IconButton aria-label="more">
                          <RemoveRedEyeIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} component="th" scope="row" align="right">
                      <Avatar src={row.profile.avatar} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold', whiteSpace: 'nowrap' }} component="th" scope="row" align="right">
                      <Link style={{ color: 'var(--main-blue-sky)' }} to={`/profile/${row.profile.profile_id}`}>{row.profile.profile_id}@</Link>
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} component="th" scope="row" align="right">
                      {row.profile.full_name.length > 0 ? row.profile.full_name : 'لايوجد إسم'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} align="right">{
                      row.profile.is_active ? <span className='bg-success px-4 text-white' style={{ borderRadius: '5px' }}>مفعل</span> : <span className='bg-secondary text-white px-4' style={{ borderRadius: '5px' }}>معطل</span>
                    }</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} align="right"><span>{formatDate(row.start_date)}</span></TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} align="right"><span>{formatDate(row.last_login)}</span></TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} align="right">{
                      row.is_superuser ? <span>مسؤل</span> :
                        row.is_staff ? <span>مساعد</span> :
                          <span>طالب</span>
                    }</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} align="right">
                      {row.profile.is_logged_in ? <span className='bg-success px-4 text-white' style={{ borderRadius: '5px' }}>نشط</span> : <span className='bg-secondary text-white px-4' style={{ borderRadius: '5px' }}>غير نشط</span>}
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }} align="right"><span>{row.profile.devices.length}</span></TableCell>

                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={10} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    sx={{ direction: 'ltr', fontSize: '1rem !important' }}
                    rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                    colSpan={10}
                    count={usersData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    slotProps={{
                      select: {
                        inputProps: {
                          'aria-label': 'rows per page',
                        },
                        native: true,
                      },
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          :
          <NoVideos imgStyle={{ width: '200px' }} msg="لايوجد  مستخدمين حتي الأن" />
      }
      <EditAccount
        openForm={openForm}
        handleCloseForm={handleCloseForm}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        isAssistant={isAssistant}
        setIsAssistant={setIsAssistant}
        isActive={isActive}
        setIsActive={setIsActive}
        handleSave={updateUser}
      />
      <Confirm
        open={openAlert}
        onConfirm={() => {
          deleteUser();
          setOpenAlert(false);
        }}
        onClose={() => setOpenAlert(false)}
        title="حذف الحساب"
        message="هل متأكد من حذف الحساب"
        cancelTitle="إلغاء"
        confirmTitle="نعم،حذف"
      />
    </>

  );
}
