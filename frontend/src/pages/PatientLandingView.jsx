import NavigationDrawer from "../components/NavigationDrawer";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString(); // or `${currentDate.getMonth() + 1} ${currentDate.getDate()} ${currentDate.getFullYear()}'
const isFinished = false; //This should check if today's checkin has been completed


const PatientView = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/check-in')
    }
    return (
        <>
            <NavigationDrawer />
            <section id="top">
                <Box sx={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'start', paddingTop: '3em', paddingLeft:'3em'}}>
                    <Typography variant="h4" >Hello Patient </Typography>
                    <Typography variant="h6" >Today is {formattedDate} </Typography>
                </Box>
                < Divider sx= {{paddingTop:'1rem'}}/>
                <Box sx={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'start', paddingTop: '1em', paddingLeft:'3em'}}>
                    <Typography variant="h4" >Welcome to CareTrack-Connect </Typography>
                    <Typography variant="h6" >Check your status below and complete your check-in!</Typography>
                </Box>
                <Box sx={{border: 2, borderRadius: '16px', margin: '1rem', paddingTop: '1rem'}}>
                    <Typography variant="h3" >Status Card </Typography>
                    <Typography variant="h4" >Today's Check-in: {isFinished ? 'Complete' : 'Not Started'} </Typography>
                    <Button onClick={handleClick}sx={{border: 1, borderRadius: '30px', display: 'inline-block', paddingLeft:'1rem',paddingRight:'1rem', marginBottom:'.5rem', marginTop:'.5rem'}}>
                        <Typography variant="h4"> {isFinished ? 'Edit Checkin' : 'Start Checkin'} </Typography>
                    </Button>
                </Box>
                
                

                
            </section>
        </>
    );
};

export default PatientView