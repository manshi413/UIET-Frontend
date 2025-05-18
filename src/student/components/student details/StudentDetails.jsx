import Greeting from "../../../basic utility components/Greeting";
import StudentProfile from "./StudentProfile";

const StudentDetails = () => {
  return (
    <>
      <Greeting role={"student"} apiEndpoint={"student/fetch-single"} />
      <StudentProfile />
    </>
  );
};

export default StudentDetails;