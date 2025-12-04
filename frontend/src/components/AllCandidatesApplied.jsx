import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabase";
import { useNavigate } from "react-router-dom";
import Navbar from "../layouts/Navbar";

const AllCandidatesApplied = ({ token }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const getJobIds = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id")
        .eq("created_by", token.user.id);

      if (error) throw error;

      const jobIds = data.map((job) => job.id);
      console.log("Job IDs:", jobIds); // Debugging log
      return jobIds;
    } catch (error) {
      console.log("Error fetching job IDs:", error.message);
      return [];
    }
  };

  const getUserInfo = async (userIds) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email") // Fetch name and email
        .in("id", userIds);

      if (error) throw error;

      return data;
    } catch (error) {
      console.log("Error fetching user info:", error.message);
      return [];
    }
  };

  const getCandidates = async () => {
    try {
      const jobIds = await getJobIds();

      if (jobIds.length === 0) {
        alert("No jobs registered by the user.");
        navigate("/dashboard");
        return;
      }

      const { data: applications, error } = await supabase
        .from("job_applications")
        .select(`
          user_id,
          job_id,
          jobs (company_name)
        `)
        .in("job_id", jobIds);

      if (error) throw error;

      console.log("Applications:", applications); // Debugging log

      const userIds = applications.map((application) => application.user_id);

      if (userIds.length === 0) {
        console.log("No candidates found for the jobs.");
        return;
      }

      const userInfo = await getUserInfo(userIds);

      const candidatesWithJobs = userInfo.map((user) => {
        const userApplications = applications.filter((app) => app.user_id === user.id);
        const jobDetails = userApplications.map((app) => ({
          jobId: app.job_id,
          companyName: app.jobs.company_name,
        }));
        return { ...user, jobDetails };
      });

      setCandidates(candidatesWithJobs);
      console.log("Candidates:", candidatesWithJobs); // Debugging log
    } catch (error) {
      console.log("Error fetching candidates:", error.message);
    }
  };

  const getSelectedCandidates = async () => {
    try {
      const jobIds = await getJobIds();

      if (jobIds.length === 0) {
        console.log("No jobs registered by the user.");
        return;
      }

      const { data: selections, error: selectionError } = await supabase
        .from("job_applications")
        .select("user_id, job_id, selected, jobs (company_name)")
        .in("job_id", jobIds);

      if (selectionError) throw selectionError;

      const selectedCandidates = selections.filter((selection) => selection.selected);

      const userIds = selectedCandidates.map((selection) => selection.user_id);

      if (userIds.length === 0) {
        console.log("No selected candidates found for the jobs.");
        return;
      }

      const userInfo = await getUserInfo(userIds);

      const selectedCandidatesWithJobs = userInfo.map((user) => {
        const userSelections = selectedCandidates.filter((sel) => sel.user_id === user.id);
        const jobDetails = userSelections.map((sel) => ({
          jobId: sel.job_id,
          companyName: sel.jobs.company_name,
        }));
        return { ...user, jobDetails };
      });

      setSelectedCandidates(selectedCandidatesWithJobs);
      console.log("Selected Candidates:", selectedCandidatesWithJobs); // Debugging log
    } catch (error) {
      console.log("Error fetching selected candidates:", error.message);
    }
  };

  useEffect(() => {
    getCandidates();
    getSelectedCandidates();
  }, []);

  return (
    <>
      <Navbar token={token} />
      <div className="container mx-auto px-4">
        <div className="mt-6">
          {candidates.length === 0 ? (
            <div className="mt-6 bg-white border border-gray-300 rounded-xl p-4 text-center">
              <p className="text-md font-bold text-gray-500">
                No candidates have applied for this job yet.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-md font-bold">All Candidates applied for the jobs created by you</h1>
              <div className="mt-6 overflow-hidden rounded-xl border shadow">
                <table className="min-w-full border-separate border-spacing-y-2 border-spacing-x-2">
                  <thead className="border-b lg:table-header-group">
                    <tr>
                      <td
                        width="50%"
                        className="whitespace-normal py-4 text-sm font-medium text-gray-500 sm:px-6"
                      >
                        Company Name
                      </td>
                      <td className="whitespace-normal py-4 text-sm font-medium text-gray-500 sm:px-6">
                        Name
                      </td>
                      <td className="whitespace-normal py-4 text-sm font-medium text-gray-500 sm:px-6">
                        Email
                      </td>
                      <td className="whitespace-normal py-4 text-sm font-medium text-gray-500 sm:px-6">
                        Status
                      </td>
                    </tr>
                  </thead>
                  <tbody className="lg:border-gray-300">
                    {candidates.map((candidate) => (
                      <tr key={candidate.email}>
                        <td
                          width="50%"
                          className="whitespace-no-wrap py-4 text-sm font-bold text-gray-900 sm:px-6"
                        >
                          {candidate.jobDetails.map((job) => (
                            <p key={job.jobId}>{job.companyName}</p>
                          ))}
                        </td>
                        <td className="whitespace-no-wrap py-4 text-sm font-bold text-gray-900 sm:px-6">
                          {candidate.name}
                        </td>
                        <td className="whitespace-no-wrap hidden py-4 text-sm font-normal text-gray-500 sm:px-6 lg:table-cell">
                          {candidate.email}
                        </td>
                        <td className="whitespace-no-wrap hidden py-4 text-sm font-normal text-gray-500 sm:px-6 lg:table-cell">
                          <div className="inline-flex items-center rounded-full bg-purple-800 py-2 px-3 text-xs text-white">
                            Applied
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="mt-10">
          {selectedCandidates.length === 0 ? (
            <div className="mt-6 bg-white border border-gray-300 rounded-xl p-4 text-center">
              <p className="text-md font-bold text-gray-500">
                No candidates have been selected for the job created by you.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-md font-bold">Selected Candidates for the jobs created by you</h1>
              <div className="mt-6 overflow-hidden rounded-xl border shadow">
                <table className="min-w-full border-separate border-spacing-y-2 border-spacing-x-2">
                  <thead className="border-b lg:table-header-group">
                    <tr>
                      <td
                        width="50%"
                        className="whitespace-normal py-4 text-sm font-medium text-gray-500 sm:px-6"
                      >
                        Company Name
                      </td>
                      <td className="whitespace-normal py-4 text-sm font-medium text-gray-500 sm:px-6">
                        Name
                      </td>
                      <td className="whitespace-normal py-4 text-sm font-medium text-gray-500 sm:px-6">
                        Email
                      </td>
                      <td className="whitespace-normal py-4 text-sm font-medium text-gray-500 sm:px-6">
                        Status
                      </td>
                    </tr>
                  </thead>
                  <tbody className="lg:border-gray-300">
                    {selectedCandidates.map((candidate) => (
                      <tr key={candidate.email}>
                        <td
                          width="50%"
                          className="whitespace-no-wrap py-4 text-sm font-bold text-gray-900 sm:px-6"
                        >
                          {candidate.jobDetails.map((job) => (
                            <p key={job.jobId}>{job.companyName}</p>
                          ))}
                        </td>
                        <td className="whitespace-no-wrap py-4 text-sm font-bold text-gray-900 sm:px-6">
                          {candidate.name}
                        </td>
                        <td className="whitespace-no-wrap hidden py-4 text-sm font-normal text-gray-500 sm:px-6 lg:table-cell">
                          {candidate.email}
                        </td>
                        <td className="whitespace-no-wrap hidden py-4 text-sm font-normal text-gray-500 sm:px-6 lg:table-cell">
                          <div className="inline-flex items-center rounded-full bg-purple-800 py-2 px-3 text-xs text-white">
                            Selected
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      
    </>
  );
};

export default AllCandidatesApplied;