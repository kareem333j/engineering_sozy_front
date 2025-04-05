import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axiosInstance from '../../Axios';
import { formatDate } from '../date-time/defaultDateFormat';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, TableFooter, TablePagination, Tooltip, useTheme } from '@mui/material';
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
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import logoImage from '../../assets/images/logos/2.png'
import { NoVideos } from '../no-data/NoVideos';
import AddIcon from '@mui/icons-material/Add';
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

function Row(props) {
    const { row } = props;
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: 'var(--main-back)' }}>
                <TableCell align="right">
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">
                    {row.title}
                </TableCell>
                <TableCell sx={{ fontSize: '1.1rem' }} align="right">{
                    row.is_active ? <span className='bg-success px-4 text-white' style={{ borderRadius: '5px' }}>نشط</span> : <span className='bg-secondary text-white px-4' style={{ borderRadius: '5px' }}>غير نشط</span>
                }</TableCell>
                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>{formatDate(row.created_dt)}</span></TableCell>
                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>{formatDate(row.update_dt)}</span></TableCell>
                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>{row.videos.length}</span></TableCell>
                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>{row.subscribers.length}</span></TableCell>
                <TableCell sx={{ fontSize: '1.1rem' }} align="right">
                    <Tooltip component={Link} to={`/courses/course/${row.id}/edit`} title="تعديل">
                        <IconButton aria-label="edit">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف" onClick={() => {
                        props.setCurrentCourseIdDeleted(row.id);
                        props.setAlertOpenedNow({ course: true, video: false });
                        props.setOpenAlert(true);
                    }}>
                        <IconButton aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        {
                            row.videos.length === 0 ? <Box className='w-100 text-end m-2' style={{ fontSize: '1.2rem' }}>لا يوجد فيديوهات في هذا االكورس</Box>
                                :
                                <Box sx={{ margin: 1 }}>
                                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold' }} align="right" variant="h6" gutterBottom component="div">
                                        <span>الفيديوهات</span>
                                    </Typography>
                                    <Table size="small" aria-label="purchases">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }} align="right"><span>#</span></TableCell>
                                                <TableCell />
                                                <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold' }} align="right"><span>اسم الفيديو</span></TableCell>
                                                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>الحالة</span></TableCell>
                                                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>تاريخ النشر</span></TableCell>
                                                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>اخر تحديث</span></TableCell>
                                                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>عدد الإعجابات</span></TableCell>
                                                <TableCell sx={{ fontSize: '1.1rem' }} align="right"><span>عدد المشاهدات</span></TableCell>
                                                <TableCell />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {row.videos.map((video, i) => (
                                                <TableRow key={video.id}>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">{i}</TableCell>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">
                                                        <div className='video-container'>
                                                            {
                                                                video.cover ? <img width='100px' src={video.cover} alt='video-cover' />
                                                                    :
                                                                    <div style={{ backgroundColor: 'rgba(128, 128, 128, 0.605)' }} className='no-image d-flex justify-content-center align-items-center py-3'>
                                                                        <img width='30px' src={logoImage} alt='video-cover' />
                                                                    </div>
                                                            }

                                                        </div>
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">
                                                        <span>{video.title}</span>
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">
                                                        {
                                                            video.is_active ? <span className='bg-success px-4 text-white' style={{ borderRadius: '5px' }}>نشط</span> : <span className='bg-secondary text-white px-4' style={{ borderRadius: '5px' }}>غير نشط</span>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">{formatDate(video.created_dt)}</TableCell>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">{formatDate(video.update_dt)}</TableCell>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">{video.likes_count}</TableCell>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} component="th" scope="row" align="right">{video.more_info.views.length}</TableCell>
                                                    <TableCell sx={{ fontSize: '1.1rem' }} align="right">
                                                        <Tooltip component={Link} to={`/courses/${row.title}/${video.id}`} title="مشاهدة">
                                                            <IconButton aria-label="edit">
                                                                <PlayCircleIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip component={Link} to={`/courses/${row.title}/${video.id}/edit`} title="تعديل">
                                                            <IconButton aria-label="edit">
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="حذف" onClick={() => {
                                                            props.setCurrentVideoIdDeleted(video.id);
                                                            props.setAlertOpenedNow({ course: false, video: true });
                                                            props.setOpenAlert(true);
                                                        }}>
                                                            <IconButton aria-label="delete">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                        }
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}


export default function AllCourses() {
    const [coursesData, setCourseData] = React.useState([]);

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - coursesData.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const [loading, setLoading] = React.useState(true);

    // snackbar
    const { enqueueSnackbar } = useSnackbar();

    const handleClickVariant = (msg, variant) => {
        enqueueSnackbar(msg, { variant, anchorOrigin: { vertical: "top", horizontal: "right" } });
    };

    const [loadingDelete, setLoadingDelete] = React.useState(false);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [currentCourseIdDeleted, setCurrentCourseIdDeleted] = React.useState(0);
    const [currentVideoIdDeleted, setCurrentVideoIdDeleted] = React.useState(0);
    const [alertOpenedNow, setAlertOpenedNow] = React.useState({ course: false, video: false });
    const deleteVideo = async () => {
        setLoadingDelete(true);
        try {
            const response = await axiosInstance.delete(`/api/admin/video/${currentVideoIdDeleted}/delete`);
            if (response.status === 204) {
                handleClickVariant('تم حذف الفيديو بنجاح', 'success');
                getCourses();
            }
        } catch (error) {
            handleClickVariant('لقد حدث خطأ', 'error');
        } finally { setLoadingDelete(false) }
    }
    const deleteCourse = async () => {
        setLoadingDelete(true);
        try {
            const response = await axiosInstance.delete(`/api/admin/courses/course/${currentCourseIdDeleted}/delete`);
            if (response.status === 204) {
                handleClickVariant('تم حذف الكورس بنجاح', 'success');
                getCourses();
            }
        } catch (error) {
            handleClickVariant('لقد حدث خطأ', 'error');
        } finally { setLoadingDelete(false) }
    }

    const getCourses = () => {
        setLoading(true);
        axiosInstance.get('/api/admin/courses_list')
            .then((response) => {
                setCourseData(response.data);
                console.log(response.data);
            })
            .catch((error) => console.log(error))
            .finally(() => setLoading(false));
    }

    React.useEffect(() => {
        getCourses();
    }, []);

    if (loading) {
        return <DefaultProgress sx={{ width: '100%', height: '70vh', display: 'flex' }} />
    }
    return (
        <>
            <Helmet>
                <title>Engineering Sozy | جميع الكورسات</title>
            </Helmet>
            <CustomLinearProgress loading={loadingDelete} />
            {
                coursesData.length > 0 ?
                    <TableContainer component={Paper} dir='rtl' sx={{ minWidth: '1000px' }}>
                        <Table aria-label="collapsible pagination table" sx={{ minWidth: '100%', backgroundColor: 'var(--main-back3)' }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'var(--main-back)' }}>
                                    <TableCell />
                                    <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}><span>اسم الكورس</span></TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}><span>الحالة</span></TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}><span>ناريخ النشر</span></TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}><span>اخر تحديث</span></TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}><span>عدد الفيديوهات</span></TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}><span>عدد الطلاب</span></TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}><span></span></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(rowsPerPage > 0
                                    ? coursesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    : coursesData
                                ).map((row) => (
                                    <Row
                                        sx={{ textAlign: 'end' }}
                                        key={row.id}
                                        row={row}
                                        setCurrentCourseIdDeleted={setCurrentCourseIdDeleted}
                                        setCurrentVideoIdDeleted={setCurrentVideoIdDeleted}
                                        setOpenAlert={setOpenAlert}
                                        setAlertOpenedNow={setAlertOpenedNow}
                                    />
                                ))}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 53 * emptyRows }}>
                                        <TableCell colSpan={8} />
                                    </TableRow>
                                )}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        sx={{ direction: 'ltr', fontSize: '1rem !important' }}
                                        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                        colSpan={8}
                                        count={coursesData.length}
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
                    <NoVideos imgStyle={{ width: '200px' }} msg="لايوجد كورسات حتي الأن" />
            }
            <div className='actions w-100 d-flex justify-content-end pt-4'>
                <Button sx={{ fontWeight: 'bold' }} component={Link} to='/courses/add course' variant="outlined" startIcon={<AddIcon />}>
                    إضافة كورس جديد
                </Button>
            </div>

            <Confirm
                open={openAlert}
                onConfirm={() => {
                    alertOpenedNow.course ? deleteCourse() : deleteVideo();
                    setOpenAlert(false);
                }}
                onClose={() => setOpenAlert(false)}
                title={alertOpenedNow.course ? "حذف الكورس" : "حذف الفيديو"}
                message={alertOpenedNow.course ? "هل متأكد من حذف هذا الكورس" : "هل متأكد من حذف هذا الفيديو"}
                cancelTitle="إلغاء"
                confirmTitle="نعم،حذف"
            />
        </>

    );
}
