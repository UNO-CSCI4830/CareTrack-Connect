import NavigationBar from "../components/NavigationBar";
import { LogoutButton } from "../features/authentication/components/LogoutButton";

const PatientView = () => {
    return (
        <>
            <NavigationBar />
            <section id="center">
                <h1>Hello Patient View</h1>
            </section>
        </>
    );
};

export default PatientView