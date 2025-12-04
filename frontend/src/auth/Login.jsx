import { useState } from "react";
import { supabase } from "../supabase/supabase"; // Use named import
import { Link, useNavigate } from "react-router-dom";

function Login({ setToken }) {
  const [formdata, setFormdata] = useState({
    email: "",
    password: "",
  });

  let navigate = useNavigate();

  const handlechange = (e) => {
    setFormdata((prevdata) => {
      return {
        ...prevdata,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handlesubmit = async (e) => {
    try {
      e.preventDefault();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formdata.email,
        password: formdata.password,
      });
      if (error) throw error;

      setToken(data);

      // Determine user type and update the users table
      const userType = data.user.user_metadata.userType === "hr" ? "HR" : "Job Applicant";
      const updateResult = await updateUserDetails(data.user, userType);

      if (!updateResult) {
        alert("Failed to update user details in the database.");
        return;
      }

      // Redirect based on user type
      if (userType === "HR") {
        navigate("/dashboard");
      } else {
        navigate("/userdashboard");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  const updateUserDetails = async (user, userType) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: user.id, // Ensure the correct user ID is used
          name: user.user_metadata.fullName || "Unknown", // Update name
          email: user.email, // Update email
          type: userType, // Update user type dynamically
        })
        .eq("id", user.id); // Match the user by their ID

      if (error) {
        console.error("Error updating user details:", error.message);
        return false;
      }

      console.log("User details updated successfully:", data);
      return true;
    } catch (error) {
      console.error("Unexpected error updating user details:", error.message);
      return false;
    }
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <div className="mx-auto flex h-screen max-w-lg flex-col md:max-w-none md:flex-row md:pr-10">
          <div className="max-w-md rounded-3xl bg-gradient-to-t from-purple-800 via-purple-800 to-purple-800 px-4 py-10 text-white sm:px-10 md:m-6 md:mr-8">
            <p className="mb-20 font-bold tracking-wider">SkillSync.</p>
            <p className="mb-4 text-3xl font-bold md:text-4xl md:leading-snug">
              Start your <br />
              journey with us
            </p>
            <p className="mb-28 leading-relaxed text-gray-200">
              HR adds jobs, users apply with resumes, get shortlisted by skills,
              tested, and top scorers receive offer letters via email.
            </p>
            <div className="bg-purple-600/80 rounded-2xl px-4 py-8">
              <p className="mb-3 text-gray-200">
                We simplify all your hiring processes with seamless features and
                no extra requirements.
              </p>
            </div>
          </div>
          <div className="px-4 py-20">
            <h2 className="mb-2 text-3xl font-bold">Login</h2>
            <span href="#" className="mb-10 block font-bold text-gray-600">
              Don't have an account?{" "}
              <Link className="text-purple-500" to="/signup">
                Signup
              </Link>
            </span>
            <p className="mb-1 font-medium text-gray-500">Login for?</p>
            <div className="mb-6 flex flex-col gap-y-2 gap-x-4 lg:flex-row">
              <div className="relative flex w-56 items-center justify-center rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-700">
                <input
                  className="peer hidden"
                  type="radio"
                  name="radio"
                  id="radio1"
                  checked
                />
                <label
                  className="peer-checked:border-purple-600 peer-checked:bg-purple-200 absolute top-0 h-full w-full cursor-pointer rounded-xl border"
                  htmlFor="radio1"
                >
                  {" "}
                </label>
                <div className="peer-checked:border-transparent peer-checked:bg-purple-600 peer-checked:ring-2 absolute left-4 h-5 w-5 rounded-full border-2 border-gray-300 bg-gray-200 ring-purple-600 ring-offset-2"></div>
                <span className="pointer-events-none z-10">HR</span>
              </div>
              <div className="relative flex w-56 items-center justify-center rounded-xl bg-gray-50 px-4 py-3 font-medium text-gray-700">
                <input
                  className="peer hidden"
                  type="radio"
                  name="radio"
                  id="radio3"
                  checked
                />
                <label
                  className="peer-checked:border-purple-600 peer-checked:bg-purple-200 absolute top-0 h-full w-full cursor-pointer rounded-xl border"
                  htmlFor="radio3"
                >
                  {" "}
                </label>
                <div className="peer-checked:border-transparent peer-checked:bg-purple-600 peer-checked:ring-2 absolute left-4 h-5 w-5 rounded-full border-2 border-gray-300 bg-gray-200 ring-purple-600 ring-offset-2"></div>
                <span className="pointer-events-none z-10">Job Applicant</span>
              </div>
            </div>
            <p className="mb-1 font-medium text-gray-500">Email</p>
            <div className="mb-4 flex flex-col">
              <div className="focus-within:border-purple-600 relative flex overflow-hidden rounded-md border-2 transition sm:w-80 lg:w-full">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  onChange={handlechange}
                  className="w-full border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <p className="mb-1 font-medium text-gray-500">Password</p>
            <div className="mb-4 flex flex-col">
              <div className="focus-within:border-purple-600 relative flex overflow-hidden rounded-md border-2 transition sm:w-80 lg:w-full">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  onChange={handlechange}
                  className="w-full border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 focus:outline-none"
                  placeholder="Choose a password (minimum 8 characters)"
                />
              </div>
            </div>
            <button
              onClick={handlesubmit}
              type="submit"
              className="hover:shadow-purple-600/40 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-8 py-3 font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/")}
              type="submit"
              className="ml-5 hover:shadow-purple-600/40 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-8 py-3 font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;