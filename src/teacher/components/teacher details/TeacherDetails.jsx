import Greeting from "../../../basic utility components/Greeting";
import TeacherProfile from "./TeacherProfile";
// import TeacherDetails from "./StudentProfile";

const TeacherDetails = () => {
  return (
    <>
      <Greeting role={"teacher"} apiEndpoint={"teacher/fetch-single"} />
      <TeacherProfile />
    </>
  );
};

export default TeacherDetails;