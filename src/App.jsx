import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import "./App.css";

const API_KEY = "AIzaSyAp96rVJ1m-OdgbjwLk-yWj_6kk978c478"; // Replace with your actual API key

async function getGeminiFilteredJobs(skill, jobs) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
  const prompt = `Here are some job listings: ${JSON.stringify(
    jobs
  )}. Based on the skill "${skill}", suggest the top 3 matching jobs. Only return job title, company, and location.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.warn("🛑 Gemini returned an empty or incomplete response:", data);
    throw new Error(data.error?.message || "Gemini response is empty.");
  }

  return data.candidates[0].content.parts[0].text;
}

function App() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    experience: "",
    description: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const q = query(collection(db, "jobs"), orderBy("created", "desc"));
    const snap = await getDocs(q);
    const jobsData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobs(jobsData);
  };

  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "jobs"), {
      ...newJob,
      created: serverTimestamp(),
    });
    setNewJob({
      title: "",
      company: "",
      location: "",
      skills: "",
      experience: "",
      description: "",
    });
    fetchJobs();
  };

  const handleGeminiFilter = async () => {
    if (!skillInput.trim()) {
      setAiSuggestions("❗ Please enter a skill to get suggestions.");
      return;
    }

    setIsLoading(true);
    setAiSuggestions("");

    try {
      console.log("👀 Skill input:", skillInput);
      console.log("📦 Jobs passed to Gemini:", jobs);

      const suggestions = await getGeminiFilteredJobs(skillInput, jobs);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("Gemini fetch failed:", error);
      setAiSuggestions("❌ Error: Gemini AI failed to generate suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>JobEazy</h1>
        <img src="/logo-jobeazy.jpeg" alt="Jobeazy Logo" className="logo" />
      </header>

      <div className="main-columns">
        <div className="left-panel">
          <form onSubmit={handleSubmit} className="post-form">
            <h2>📝 Post a Job</h2>
            <input
              name="title"
              placeholder="Job Title"
              value={newJob.title}
              onChange={handleChange}
              required
            />
            <input
              name="company"
              placeholder="Company"
              value={newJob.company}
              onChange={handleChange}
              required
            />
            <input
              name="location"
              placeholder="Location"
              value={newJob.location}
              onChange={handleChange}
              required
            />
            <input
              name="skills"
              placeholder="Skills (comma-separated)"
              value={newJob.skills}
              onChange={handleChange}
              required
            />
            <input
              name="experience"
              placeholder="Experience (e.g., 2+ years)"
              value={newJob.experience}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Job Description"
              value={newJob.description}
              onChange={handleChange}
              required
            />
            <button type="submit">➕ Post Job</button>
          </form>

          <h2>📋 Available Jobs</h2>
          {jobs.length === 0 ? (
            <p>No jobs posted yet.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p>
                  <strong>Company:</strong> {job.company}
                </p>
                <p>
                  <strong>Location:</strong> {job.location}
                </p>
                <p>
                  <strong>Experience:</strong> {job.experience}
                </p>
                <p>
                  <strong>Skills:</strong> {job.skills}
                </p>
                <p>{job.description}</p>
              </div>
            ))
          )}
        </div>

        <div className="right-panel">
          <div className="gemini-section">
            <h2>🎯 Gemini AI Job Suggestions</h2>
            <div className="gemini-input">
              <input
                type="text"
                placeholder="Enter a skill (e.g., React)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
              />
              <button onClick={handleGeminiFilter}>Suggest Jobs</button>
            </div>
            {isLoading ? (
              <p>⏳ Generating suggestions...</p>
            ) : (
              <pre className="gemini-output">{aiSuggestions}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
