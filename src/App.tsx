
import {  useEffect, useState } from "react";
import {
  LayoutDashboard,
  Target,
  Route,
  FolderKanban,
  Mic,
  BriefcaseBusiness,
  Settings,
  Bell,
  Search,
  ArrowUpRight,
  Sparkles,
  Brain,
  CheckCircle2,
  Clock3,
  ChevronRight,
  Zap,
  ChevronDown,
} from "lucide-react";
import "./App.css";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Skill Gap Analysis", icon: Target },
  { label: "Career Roadmap", icon: Route },
  { label: "Portfolio Projects", icon: FolderKanban },
  { label: "Mock Interviews", icon: Mic },
  { label: "Job Tracker", icon: BriefcaseBusiness },
];



const interviewQuestions = [
  {
    question: "Tell me about yourself and your career goals.",
    keywords: ["experience", "skills", "project", "goal"],
    expectedConcepts: [
      "background",
      "relevant skills",
      "project or experience",
      "career goal"
    ],
    sampleAnswer:
      "I am an aspiring data scientist interested in using data to solve real-world problems. I have been developing my skills in Python, data analysis, and machine learning through practical projects. My goal is to gain industry experience, contribute to meaningful projects, and eventually build my own startup."
  },
  {
    question: "How would you handle missing values in a dataset?",
    keywords: ["missing", "imputation", "mean", "median", "delete", "data"],
    expectedConcepts: [
      "identify missing values",
      "remove rows or columns when appropriate",
      "impute numerical values using mean or median",
      "impute categorical values using mode",
      "consider why values are missing",
      "avoid introducing bias or data leakage"
    ],
    sampleAnswer:
      "First, I would identify the number and pattern of missing values. If only a few records are missing and removing them would not introduce bias, I might drop those rows. For numerical data, I could use mean or median imputation depending on the distribution and outliers. For categorical data, I might use the mode or an explicit unknown category. I would validate the approach and fit any imputation process only on the training data to prevent data leakage."
  },
  {
    question: "Explain a machine learning project you would build.",
    keywords: ["data", "model", "train", "evaluate", "prediction", "metrics"],
    expectedConcepts: [
      "define the problem",
      "collect and clean data",
      "select and train a model",
      "evaluate using suitable metrics",
      "compare against a baseline",
      "explain the expected impact"
    ],
    sampleAnswer:
      "I would build a customer churn prediction application. First, I would define the prediction target and collect relevant customer data. I would clean the data, explore patterns, and split it into training and test sets. Then I would train a baseline model and compare suitable algorithms. I would evaluate precision, recall, F1-score, and other relevant metrics, then build a simple application to demonstrate predictions and explain how the results could help a business retain customers."
  }
];


function App() {
  const [active, setActive] = useState("Overview");
  const [completed, setCompleted] = useState([true, false, false]);
  const [targetRole, setTargetRole] = useState("data scientist");
  const [skillsInput, setSkillsInput] = useState("Python, SQL");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [interviewQuestion, setInterviewQuestion] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState("");
  const [interviewScore, setInterviewScore] = useState<number | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [roadmapResult, setRoadmapResult] = useState<any>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState("");
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);

  const [skillLevels, setSkillLevels] = useState<Record<string, string>>(() => {
  try {
    return JSON.parse(
      localStorage.getItem("ascendai-skill-levels") || "{}"
    );
  } catch {
    return {};
  }
});
type JobApplication = {
  id: number;
  company: string;
  role: string;
  location: string;
  date: string;
  status: string;
  link: string;
  notes: string;
};

const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
  try {
    const saved = localStorage.getItem("ascendai-job-applications");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});

const [jobForm, setJobForm] = useState({
  company: "",
  role: "",
  location: "",
  date: new Date().toISOString().slice(0, 10),
  status: "Applied",
  link: "",
  notes: "",
});

const [showJobForm, setShowJobForm] = useState(false);

useEffect(() => {
  localStorage.setItem(
    "ascendai-job-applications",
    JSON.stringify(jobApplications)
  );
}, [jobApplications]);

const jobStatuses = [
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
];  


const proficiencyPoints: Record<string, number> = {
  Beginner: 25,
  Intermediate: 60,
  Advanced: 90,
};

const ratedSkillNames = Object.keys(skillLevels).filter(
  (skill) => proficiencyPoints[skillLevels[skill]] !== undefined
);


const skillReadiness =
  ratedSkillNames.length > 0
    ? Math.round(
        ratedSkillNames.reduce((total, skill) => {
          const level = skillLevels[skill];
          return total + (proficiencyPoints[level] ?? 0);
        }, 0) / ratedSkillNames.length
      )
    : 0;









const averageProficiency =
  ratedSkillNames.length > 0
    ? Math.round(
        ratedSkillNames.reduce(
          (total, skill) =>
            total + (proficiencyPoints[skillLevels[skill]] ?? 0),
          0
        ) / ratedSkillNames.length
      )
    : 0;

  const [completedMilestones, setCompletedMilestones] = useState<number[]>(
  () => {
    try {
      const saved = localStorage.getItem("ascendai-completed-milestones");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
);
const roadmapProgress =
  roadmapResult?.roadmap?.length > 0
    ? Math.round(
        (completedMilestones.length /
          roadmapResult.roadmap.length) *
          100
      )
    : 0;

const readinessScore = analysisResult
  ? Math.min(
      100,
      Math.round(
        skillReadiness * 0.7 +
          roadmapProgress * 0.3
      )
    )
  : 0;
  useEffect(() => {
  localStorage.setItem(
    "ascendai-completed-milestones",
    JSON.stringify(completedMilestones)
  );
}, [completedMilestones]);

  useEffect(() => {
  localStorage.setItem(
    "ascendai-skill-levels",
    JSON.stringify(skillLevels)
  );
}, [skillLevels]);
  const [projectStatuses, setProjectStatuses] = useState<
  Record<string, boolean>
>({});
  const tasks = [
    "Complete your target role assessment",
    "Strengthen Python and SQL fundamentals",
    "Build your first portfolio project",
  ];
  async function analyzeSkills() {
  setAnalysisLoading(true);
  setAnalysisError("");
  setAnalysisResult(null);

  const currentSkills = skillsInput
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  try {
    const response = await fetch("http://127.0.0.1:8000/skill-gap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target_role: targetRole.trim(),
        current_skills: currentSkills,
      }),
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Analysis failed.");
    }

    if (data.error) {
      throw new Error(data.error);
    }

    setAnalysisResult(data);
  } catch (error) {
    setAnalysisError(
      error instanceof Error
        ? error.message
        : "Could not connect to the AscendAI API."
    );
  } finally {
    setAnalysisLoading(false);
  }
}
  async function generateRoadmap() {
  setRoadmapLoading(true);
  setRoadmapError("");
  setRoadmapResult(null);

  try {
    if (!analysisResult) {
      throw new Error(
        "Please run Skill Gap Analysis first."
      );
    }

    const response = await fetch(
      "http://127.0.0.1:8000/career-roadmap",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_role: targetRole,
          missing_skills: analysisResult.missing_skills,
          skill_levels: skillLevels,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
  throw new Error(
    data.detail || data.error || "Could not generate your roadmap."
  );
}

    setRoadmapResult(data);
  } catch (error) {
    setRoadmapError(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );
  } finally {
    setRoadmapLoading(false);
  }
}
  return (
    
<div
  className="app-shell"
  onMouseMove={(event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty("--cursor-x", `${x}%`);
    event.currentTarget.style.setProperty("--cursor-y", `${y}%`);
  }}
>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={22} /></div>
          <div>
            <h2>Ascend<span>AI</span></h2>
            <p>YOUR CAREER, REIMAGINED</p>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "active" : ""}`}
              onClick={() => setActive(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {active === label && <ChevronRight size={16} className="nav-chevron" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon"><Zap size={18} /></div>
            <h3>Your next level awaits.</h3>
            <p>Build momentum, one skill at a time.</p>
            <button onClick={() => setActive("Career Roadmap")}>
              Explore roadmap <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="nav-item settings" onClick={() => setActive("Settings")}>
            <Settings size={18} /> Settings
          </button>
          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-text">
              <strong>Aspiring Professional</strong>
              <span>Free plan</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <strong>{active}</strong></div>
          <div className="top-actions">
            <label className="search-box">
              <Search size={17} />
              <input placeholder="Search your workspace..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
              <i />
            </button>
            <div className="avatar top-avatar">A</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="live-dot" /> YOUR PERSONAL CAREER INTELLIGENCE</div>
              <h1>{active === "Overview" ? <>Make your next move<br /><span>your best move.</span></> : active}</h1>
              <p className="welcome-subtitle">
                {active === "Overview"
                  ? "Your goals are closer than you think. Let's make them happen."
                  : `Your ${active.toLowerCase()} workspace. Your next step starts here.`}
              </p>
            </div>
            <button className="primary-button" onClick={() => setActive("Skill Gap Analysis")}>
              <Sparkles size={17} /> Analyze my skills
            </button>
          </section>
          
          
{active === "Skill Gap Analysis" && (
  <section className="gap-studio">
    <div className="gap-hero">
      <div>
        <span className="section-kicker">CAREER INTELLIGENCE / 01</span>
        <h2>Understand your skill gap.</h2>
        <p>
          Your current abilities, compared with what your
          target role demands.
        </p>
      </div>
      <div className="gap-hero-icon">
        <Target size={28} />
      </div>
    </div>

    <div className="gap-layout">
      <div className="panel gap-input-panel">
        <div className="gap-panel-title">
          <span className="gap-icon"><Sparkles size={19} /></span>
          <div>
            <h3>Build your profile</h3>
            <p>Start with your target and current skills.</p>
          </div>
        </div>

        <label className="gap-field">
          <strong>Target role</strong>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          >
            <option value="data scientist">Data Scientist</option>
            <option value="software engineer">Software Engineer</option>
            <option value="machine learning engineer">
              Machine Learning Engineer
            </option>
            <option value="frontend developer">Frontend Developer</option>
          </select>
        </label>

        <label className="gap-field">
          <strong>Skills you already have</strong>
          <textarea
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="Python, SQL, Pandas, Git..."
            rows={4}
          />
          <small>Separate each skill with a comma.</small>
        </label>

        <button
          className="primary-button gap-analyze-button"
          onClick={analyzeSkills}
          disabled={analysisLoading || !targetRole.trim()}
        >
          <Sparkles size={17} />
          {analysisLoading ? "Analysing your profile..." : "Run skill diagnosis"}
          {!analysisLoading && <ArrowUpRight size={17} />}
        </button>

        {analysisError && (
          <p className="gap-error" role="alert">{analysisError}</p>
        )}
      </div>

      <div className="gap-results-column">
        <div className="panel gap-readiness-panel">
          <div className="gap-section-heading">
            <div>
              <span className="section-kicker">YOUR ROLE MATCH</span>
              <h3>Career readiness</h3>
            </div>
            <span className="gap-live-label">
              {analysisResult ? "Analysis complete" : "Awaiting analysis"}
            </span>
          </div>

          <div className="gap-score-layout">
            <div
              className="gap-score-ring"
              style={{
                background: `conic-gradient(#48d9cb ${
                  analysisResult?.readiness_percentage ?? 0
                }%, #26344b 0)`,
              }}
            >
              <div className="gap-score-inner">
                <strong>
                  {analysisResult
                    ? `${analysisResult.readiness_percentage}%`
                    : "—"}
                </strong>
                <span>ROLE MATCH</span>
              </div>
            </div>

            <div className="gap-score-copy">
              <span className="section-kicker">YOUR NEXT MOVE</span>
              <h3>
                {!analysisResult
                  ? "Discover your starting point."
                  : analysisResult.missing_skills.length
                    ? "Close your biggest gap."
                    : "You're covering the key skills."}
              </h3>
              <p>
                {!analysisResult
                  ? "Run your skill diagnosis to reveal your strengths and learning priorities."
                  : analysisResult.missing_skills.length
                    ? `Start with ${analysisResult.missing_skills[0]} and build from there.`
                    : "Use your strengths to build projects and prepare for your target role."}
              </p>
            </div>
          </div>

          <div className="gap-stat-strip">
            <div>
              <span className="gap-stat-dot matched-dot" />
              <strong>{analysisResult?.matched_skills.length ?? "—"}</strong>
              <small>Matched skills</small>
            </div>
            <div>
              <span className="gap-stat-dot missing-dot" />
              <strong>{analysisResult?.missing_skills.length ?? "—"}</strong>
              <small>Skills to develop</small>
            </div>
          </div>
        </div>

        <div className="gap-skill-columns">
          <div className="panel gap-skill-panel">
            <span className="section-kicker">YOUR ADVANTAGE</span>
            <h3>Skills that match</h3>

            {analysisResult ? (
              analysisResult.matched_skills.length ? (
                <div className="gap-skill-list">
                  {analysisResult.matched_skills.map((skill: string) => (
                    <div className="gap-skill-item" key={skill}>
                      <CheckCircle2 size={16} />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="gap-empty">Your next strength starts with your first skill.</p>
              )
            ) : (
              <p className="gap-empty">Your matching skills will appear here.</p>
            )}
          </div>

          <div className="panel gap-skill-panel">
            <span className="section-kicker">OPPORTUNITY ZONE</span>
            <h3>Skills to focus on</h3>

            {analysisResult ? (
              analysisResult.missing_skills.length ? (
                <div className="gap-skill-list">
                  {analysisResult.missing_skills.map((skill: string, index: number) => (
                    <div className="gap-skill-item gap-missing-item" key={skill}>
                      <span className="gap-priority-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{skill}</span>
                      <ArrowUpRight size={15} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="gap-empty">No skill gaps identified in this assessment.</p>
              )
            ) : (
              <p className="gap-empty">Your priority skills will appear after analysis.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
)}

          
          {active === "Career Roadmap" && (
            <section className="panel" style={{ marginBottom: 24 }}>
              <div className="panel-heading">
                <div>
                  <span className="section-kicker">
                    YOUR PERSONAL ACTION PLAN
                  </span>
                  <h2>Your career roadmap</h2>
                </div>
                <Route size={24} />
              </div>

              <p className="panel-description">
                Turn your skill gaps into focused learning milestones
                and portfolio projects.
              </p>

              <p>
                <strong>Target role:</strong> {targetRole}
              </p>

              <button
                className="primary-button"
                onClick={generateRoadmap}
                disabled={roadmapLoading}
              >
                <Sparkles size={17} />
                {roadmapLoading
                  ? "Building your roadmap..."
                  : "Generate my roadmap"}
              </button>

              {roadmapError && (
                <p role="alert" style={{ color: "#f87171" }}>
                  {roadmapError}
                </p>
              )}

              
{roadmapResult && (
  <div style={{ marginTop: 28 }}>
    {(() => {
      const steps = roadmapResult.roadmap;
      const completedCount = steps.filter(
        (step: any) => completedMilestones.includes(step.step)
      ).length;

      const progress = steps.length
        ? Math.round((completedCount / steps.length) * 100)
        : 0;

      return (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3>Your learning progress</h3>
              <p className="panel-description">
                {completedCount} of {steps.length} milestones completed
              </p>
            </div>
            <strong>{progress}%</strong>
          </div>

          <div
            className="progress-track"
            style={{ margin: "16px 0 28px" }}
          >
            <div
              className="progress-fill blue-fill"
              style={{
                width: `${progress}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <div className="roadmap">
            
{steps.map((step: any) => {
  const isCompleted = completedMilestones.includes(step.step);

  return (
    <details
      className={`roadmap-step roadmap-compact ${isCompleted ? "done" : ""}`}
      key={step.step}
    >
      <summary className="roadmap-summary">
        <span className="roadmap-node">
          {isCompleted ? (
            <CheckCircle2 size={18} />
          ) : (
            <span>{step.step}</span>
          )}
        </span>

        <span className="roadmap-summary-content">
          <strong>{step.skill}</strong>
          <span className="roadmap-summary-meta">
            <Clock3 size={13} />
            {step.duration}
          </span>
        </span>

        <span className={`step-status ${isCompleted ? "done-status" : ""}`}>
          {isCompleted ? "Completed" : "View details"}
        </span>

        <ChevronDown size={17} className="roadmap-chevron" />
      </summary>

      <div className="roadmap-details">
        <p>{step.learning_focus}</p>

        <div className="roadmap-project">
          <strong>Portfolio project</strong>
          <p>{step.project}</p>
        </div>

        {step.resources && step.resources.length > 0 && (
          <div className="learning-resources">
            <strong>Recommended learning resources</strong>
            <ul>
              {step.resources.map((resource: {
                title: string;
                url: string;
                type: string;
              }) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.title} ↗
                  </a>
                  <small>{resource.type}</small>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          className="roadmap-completion-button"
          onClick={() => {
            setCompletedMilestones((previous: any) =>
              isCompleted
                ? previous.filter((item: any) => item !== step.step)
                : [...previous, step.step]
            );
          }}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={15} />
              Completed — undo
            </>
          ) : (
            "Mark as completed"
          )}
        </button>
      </div>
    </details>
  );
})}

          </div>

          {progress === 100 && (
            <div
              className="skill-footer"
              style={{ marginTop: 20 }}
            >
              <Sparkles size={18} />
              <span>
                <strong>Roadmap completed!</strong> You've checked off
                every milestone. Time to showcase your skills!
              </span>
            </div>
          )}
        </>
      );
    })()}
  </div>
)}

                   

              {!analysisResult && !roadmapError && (
                <p style={{ marginTop: 20 }}>
                  Run Skill Gap Analysis first to personalize this roadmap.
                </p>
              )}
            </section>
          )}
{active === "Portfolio Projects" && (
  <section className="panel" style={{ marginBottom: 24 }}>
    <div className="panel-heading">
      <div>
        <span className="section-kicker">BUILD YOUR PROFILE</span>
        <h2>Portfolio Projects</h2>
      </div>
      <FolderKanban size={24} />
    </div>

    <p className="panel-description">
      Turn your skills into practical projects that demonstrate your abilities
      to recruiters.
    </p>

    
<div className="portfolio-grid">
  {[
    {
      title: "Exploratory Data Analysis",
      skill: "Python, Pandas and Visualization",
      description:
        "Explore real-world data, uncover hidden patterns, and turn your findings into clear visual insights.",
      level: "Beginner",
      icon: "📊",
      duration: "1–2 weeks",
      tags: ["Python", "Pandas", "Matplotlib"],
    },
    {
      title: "Machine Learning Prediction App",
      skill: "Scikit-learn and Model Evaluation",
      description:
        "Train a predictive model, evaluate its performance, and turn it into an interactive application.",
      level: "Intermediate",
      icon: "🤖",
      duration: "2–3 weeks",
      tags: ["Scikit-learn", "ML", "Evaluation"],
    },
    {
      title: "End-to-End Data Science Project",
      skill: "Data Cleaning, ML and Deployment",
      description:
        "Build a complete data science workflow, from raw data and model training to deployment and documentation.",
      level: "Advanced",
      icon: "🚀",
      duration: "3–4 weeks",
      tags: ["Data Science", "Deployment", "Git"],
    },
  ].map((project) => {
    const isAdded = Boolean(projectStatuses[project.title]);

    return (
      <article
        className={`portfolio-card portfolio-${project.level.toLowerCase()}`}
        key={project.title}
      >
        <div className="portfolio-card-top">
          <div className="portfolio-project-icon">
            {project.icon}
          </div>

          <span
            className={`portfolio-level level-${project.level.toLowerCase()}`}
          >
            {project.level}
          </span>
        </div>

        <div className="portfolio-card-content">
          <h3>{project.title}</h3>
          <p className="portfolio-skill">{project.skill}</p>
          <p className="portfolio-description">
            {project.description}
          </p>

          <div className="portfolio-tags">
            {project.tags.map((tag) => (
              <span className="portfolio-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="portfolio-card-footer">
          <span className="portfolio-duration">
            <Clock3 size={14} />
            {project.duration}
          </span>

          <button
            type="button"
            className={`portfolio-action ${isAdded ? "is-added" : ""}`}
            onClick={() => {
              setProjectStatuses((previous) => ({
                ...previous,
                [project.title]: !previous[project.title],
              }));

              if (!isAdded) {
                setCompletedProjects((previous) =>
                  previous.includes(project.title)
                    ? previous
                    : [...previous, project.title]
                );
              } else {
                setCompletedProjects((previous) =>
                  previous.filter((title) => title !== project.title)
                );
              }
            }}
          >
            {isAdded ? (
              <>
                <CheckCircle2 size={16} />
                Added
              </>
            ) : (
              <>
                Start project
                <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </div>
      </article>
    );
})}
</div>
</section>

)}


{active === "Job Tracker" && (
  <section>
    <div className="job-tracker-heading">
  <p>Your applications, interviews, and offers in one place.</p>

      <button
        className="primary-button"
        onClick={() => setShowJobForm(!showJobForm)}
      >
        {showJobForm ? "Cancel" : "+ Add application"}
      </button>
    </div>

    <div className="stats-grid">
      {[
        { label: "Total applications", value: jobApplications.length },
        {
          label: "Interviews",
          value: jobApplications.filter(
            (job) => job.status === "Interview"
          ).length,
        },
        {
          label: "Offers",
          value: jobApplications.filter(
            (job) => job.status === "Offer"
          ).length,
        },
        {
          label: "In progress",
          value: jobApplications.filter(
            (job) =>
              !["Offer", "Rejected"].includes(job.status)
          ).length,
        },
      ].map((stat) => (
        <div className="stat-card" key={stat.label}>
          <p>{stat.label}</p>
          <h2>{stat.value}</h2>
        </div>
      ))}
    </div>

    {showJobForm && (
      <form
        className="panel job-application-form"
        onSubmit={(event) => {
          event.preventDefault();

          if (!jobForm.company.trim() || !jobForm.role.trim()) {
            return;
          }

          setJobApplications((previous) => [
            {
              ...jobForm,
              id: Date.now(),
              company: jobForm.company.trim(),
              role: jobForm.role.trim(),
            },
            ...previous,
          ]);

          setJobForm({
            company: "",
            role: "",
            location: "",
            date: new Date().toISOString().slice(0, 10),
            status: "Applied",
            link: "",
            notes: "",
          });

          setShowJobForm(false);
        }}
        style={{ marginBottom: 24 }}
      >
        <h2>Add a job application</h2>

        <div className="form-grid">
          {(
            [
              ["company", "Company name"],
              ["role", "Job title"],
              ["location", "Location"],
              ["link", "Job posting URL"],
            ] as const
          ).map(([field, label]) => (
            <div className="job-form-field" key={field}>
            <label htmlFor={`job-${field}`}>
              {label}
              <input
                id={`job-${field}`}
                required={field === "company" || field === "role"}
                type="text"
                value={jobForm[field]}
                placeholder={label}
                onChange={(event) =>
                  setJobForm((previous) => ({
                    ...previous,
                    [field]: event.target.value,
                  }))
                }
              />
            </label>
            </div>
          ))}

          
<div className="job-form-field">
  <label htmlFor="job-date">Application date</label>
  <input
    id="job-date"
    type="date"
    value={jobForm.date}
    onChange={(event) =>
      setJobForm((previous) => ({
        ...previous,
        date: event.target.value,
      }))
    }
  />
</div>


          
<div className="job-form-field">
  <label htmlFor="job-status">Application status</label>
  <select
    id="job-status"
    value={jobForm.status}
    onChange={(event) =>
      setJobForm((previous) => ({
        ...previous,
        status: event.target.value,
      }))
    }
  >
    <option value="Applied">Applied</option>
    <option value="In Progress">In Progress</option>
    <option value="Interview">Interview</option>
    <option value="Offer">Offer</option>
    <option value="Rejected">Rejected</option>
  </select>
</div>

        </div>

        
<div className="job-form-field">
  <label htmlFor="job-notes">Notes</label>
  <textarea
    id="job-notes"
    value={jobForm.notes}
    placeholder="Recruiter details, interview date, next steps..."
    onChange={(event) =>
      setJobForm((previous) => ({
        ...previous,
        notes: event.target.value,
      }))
    }
  />
</div>


        <button
          className="primary-button"
          type="submit"
          style={{ marginTop: 16 }}
        >
          Save application
        </button>
      </form>
    )}

    <div className="panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">YOUR OPPORTUNITIES</span>
          <h2>Applications</h2>
        </div>
        <BriefcaseBusiness size={24} />
      </div>

      {jobApplications.length === 0 ? (
        <div style={{ padding: "32px 0", textAlign: "center" }}>
          <BriefcaseBusiness size={36} />
          <h3>No applications yet</h3>
          <p className="panel-description">
            Add your first application to start tracking your career progress.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          
{jobApplications.map((job) => (
  <div
    key={job.id}
    className="job-application-card"
  >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div className="job-card-header">
                <div>
                  <h3>{job.role}</h3>
                  <p className="panel-description">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                  <small>
                    Applied on: {job.date || "Not specified"}
                  </small>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setJobApplications((previous) =>
                      previous.filter((item) => item.id !== job.id)
                    )
                  }
                >
                  Delete
                </button>
              </div>
              </div>

              
<div className="job-form-field">
  <label htmlFor={`status-${job.id}`}>Application status</label>
  <select
    id={`status-${job.id}`}
    className="job-status-select"
    value={job.status}
    onChange={(event) =>
      setJobApplications((previous) =>
        previous.map((item) =>
          item.id === job.id
            ? { ...item, status: event.target.value }
            : item
        )
      )
    }
  >
    {jobStatuses.map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
</div>


              {job.link && (
                <a
                  href={job.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View job posting ↗
                </a>
              )}

              {job.notes && <p>{job.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
)}


{active === "Mock Interviews" && (
  <section className="panel" style={{ marginBottom: 24 }}>
    <div className="panel-heading">
      <div>
        <span className="section-kicker">PRACTICE MODE</span>
        <h2>AI Mock Interview</h2>
      </div>
      <Mic size={24} />
    </div>

    <p className="panel-description">
      Practice interview questions for your target role: {targetRole}.
    </p>

    <p className="muted">
      Question {interviewQuestion + 1} of {interviewQuestions.length}
    </p>

    <h3>{interviewQuestions[interviewQuestion].question}</h3>

    <textarea
      value={interviewAnswer}
      onChange={(event) => setInterviewAnswer(event.target.value)}
      placeholder="Structure your answer and include relevant examples..."
      rows={6}
      style={{
        width: "100%",
        boxSizing: "border-box",
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        background: "#111827",
        color: "#f8fafc",
        border: "1px solid #334155",
        font: "inherit",
      }}
    />

    <button
      type="button"
      className="primary-button"
      style={{ marginTop: 16 }}
      onClick={async() => {
      
if (!interviewAnswer.trim()) {
  setInterviewFeedback("Please enter your answer before evaluating.");
  setInterviewScore(null);
  return;
}

setInterviewFeedback("AI is evaluating your answer...");
setInterviewScore(null);

try {
  const response = await fetch(
    "http://127.0.0.1:8000/interview/evaluate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: interviewQuestions[interviewQuestion].question,
        answer: interviewAnswer.trim(),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to evaluate your answer."
    );
  }

  setInterviewFeedback(data.feedback);

  


  

  const scoreMatch = data.feedback.match(
    /Score:\s*(\d{1,3})\s*\/\s*100/i
  );

      if (scoreMatch) {
        const score = Number(scoreMatch[1]);
        setInterviewScore(
          score >= 0 && score <= 100 ? score : null
        );
      } else {
        setInterviewScore(null);
      }
    } catch (error) {
      console.error("Interview evaluation error:", error);

      setInterviewFeedback(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setInterviewScore(null);
    }
  }}
>
  Submit Answer
</button>


    {interviewFeedback && (
      <div style={{ marginTop: 20 }}>
        
<h3>AI Interview Feedback</h3>

{interviewScore !== null && (
  <p>AI Score: {interviewScore}/100</p>
)}

<div
  style={{
    marginTop: 12,
    padding: 20,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  }}
>
  {interviewFeedback
    .replace(/\*\*/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")}
</div>


        <button
          type="button"
          className="text-button"
          onClick={() => {
            setInterviewQuestion(
              (previous) =>
                (previous + 1) % interviewQuestions.length
            );
            setInterviewAnswer("");
            setInterviewFeedback("");
            setInterviewScore(null);
          }}
        >
          Next question →
        </button>
      </div>
    )}
  </section>
)}       
<section className="stats-grid">
  

  <div className="stat-card">
    <div className="stat-top">
      <span>Skills to develop</span>
      <div className="stat-icon purple"><Brain size={19} /></div>
    </div>
    <div className="stat-value">
      {analysisResult
        ? String(analysisResult.missing_skills.length).padStart(2, "0")
        : "—"}
    </div>
    <p className="stat-note">
      <span className="mini-dot purple-dot" />
      {analysisResult
        ? "Skills identified in your assessment"
        : "Awaiting your first assessment"}
    </p>
    <p className="muted">Focus on one skill at a time.</p>
  </div>

  <div className="stat-card">
    <div className="stat-top">
      <span>Roadmap progress</span>
      <div className="stat-icon orange"><Zap size={19} /></div>
    </div>
    <div className="stat-value">
      {roadmapResult ? roadmapProgress : 0}<span>%</span>
    </div>
    <p className="stat-note">
      {roadmapResult
        ? `${completedMilestones.length} of ${roadmapResult.roadmap.length} milestones completed`
        : "Generate your career roadmap to begin"}
    </p>
    <p className="muted">Every milestone moves you forward.</p>
  </div>

  <div className="stat-card">
    <div className="stat-top">
      <span>Projects completed</span>
      <div className="stat-icon green"><FolderKanban size={19} /></div>
    </div>
    <div className="stat-value">{completedProjects.length}</div>
    <p className="stat-note">
      {completedProjects.length === 0
        ? "No projects completed yet"
        : `${completedProjects.length} project${completedProjects.length === 1 ? "" : "s"} completed`}
    </p>
    <p className="muted">
      Complete a portfolio project to update your progress.
    </p>
  </div>
</section>


<section className="middle-grid">
            <div className="panel skill-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">YOUR PROGRESS</span><h2>Skill development</h2></div>
                <button className="text-button" onClick={() => setActive("Skill Gap Analysis")}>View analysis <ArrowUpRight size={15} /></button>
              </div>
              <p className="panel-description">A snapshot of your journey toward your target role.</p>
              {(() => {
                const skillColors = [
                  "blue-fill",
                  "purple-fill",
                  "cyan-fill",
                  "green-fill",
                ];

                const matchedSkills: string[] = analysisResult?.matched_skills ?? [];
                const missingSkills: string[] = analysisResult?.missing_skills ?? [];

                
                const skillsToShow = analysisResult
                  ? [
                      ...matchedSkills.map((skill) => ({
                        name: skill,
                        status: "Matched",
                      })),
                      ...missingSkills.map((skill) => ({
                        name: skill,
                        status: "To develop",
                      })),
                    ].map((skill) => {
                      const level = skillLevels[skill.name] || "";

                      const percentages: Record<string, number> = {
                        Beginner: 25,
                        Intermediate: 60,
                        Advanced: 90,
                      };

                      return {
                        ...skill,
                        level,
                        percentage: percentages[level] ?? 0,
                      };
                    })
                  : [];


                return (
                  <>
                    
                  {skillsToShow.map((skill, index) => (
                    <div className="skill-row" key={skill.name}>
                      <div className="skill-info">
                        <span>{skill.name}</span>
                        <strong>
                          {skill.level || skill.status}
                          {skill.level ? ` · ${skill.percentage}%` : ""}
                        </strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className={`progress-fill ${
                            skillColors[index % skillColors.length]
                          }`}
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>

                      <select
                        aria-label={`Self-assessed proficiency in ${skill.name}`}
                        value={skillLevels[skill.name] || ""}
                        onChange={(event) => {
                          const value = event.target.value;

                          setSkillLevels((previous) => {
                            const next = { ...previous };

                            if (value) {
                              next[skill.name] = value;
                            } else {
                              delete next[skill.name];
                            }

                            return next;
                          });
                        }}
                        style={{
                          marginTop: 8,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "#151c29",
                          color: "#e8edf8",
                          border: "1px solid #30394a",
                        }}
                      >
                        <option value="">Rate your skill...</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  ))}


                    {analysisResult
                    ? analysisResult.missing_skills.length > 0
                      ? `Focus next on ${analysisResult.missing_skills[0]} to close your skill gap.`
                      : "Your assessment shows no missing skills for this role."
                    : "Complete a skill assessment to receive a personalized focus area."}
                  </>
                );
              })()}

              <div className="skill-footer"><Sparkles size={15} /><span>Focus on{" "}
              <strong>
                {analysisResult?.missing_skills?.[0] ?? "your next skill"}
              </strong>{" "}
              to close your biggest skill gap.</span></div>
            </div>

            <div className="panel readiness-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">THE BIG PICTURE</span><h2>Your readiness</h2></div>
                <span className="pill">In progress</span>
              </div>
              <div className="readiness-visual">
                
              <div
                className="readiness-ring"
                style={{
                  background: analysisResult
                    ? `conic-gradient(#6d8cff ${readinessScore * 3.6}deg, #252d3c ${readinessScore * 3.6}deg)`
                    : undefined,
                }}
              >

                <div>
                  
                <strong>
                  {analysisResult ? readinessScore : "—"}
                  {analysisResult && <span>%</span>}
                </strong>

                  <small>READY</small>
                </div>
              </div>
              </div>
              <p className="readiness-copy">
              {analysisResult
                ? `Your latest assessment is for ${analysisResult.target_role}. Keep working on your missing skills.`
                : "Complete your first skill assessment to see your current career readiness."}
            </p>

            <div className="readiness-meta">
              <span>Current level</span>
              <strong>
                
                {!analysisResult
                  ? "Not assessed"
                  : averageProficiency >= 75
                    ? "Strong foundation"
                    : averageProficiency >= 50
                      ? "Developing"
                      : "Getting started"}

              </strong>
            </div>

            <div className="readiness-meta">
              <span>Next milestone</span>
              <strong>
                {analysisResult
                  ? `${Math.min(
                      100,
                      Math.ceil(
                        (analysisResult.readiness_percentage + 1) / 10
                      ) * 10
                    )}% readiness`
                  : "Run an assessment"}
              </strong>
            </div>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel roadmap-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">YOUR GAME PLAN</span><h2>Career roadmap</h2></div>
                <button className="text-button" onClick={() => setActive("Career Roadmap")}>Full roadmap <ArrowUpRight size={15} /></button>
              </div>
              <p className="panel-description">Small steps. Meaningful progress. A career built by you.</p>
              <div className="roadmap">
                <div className="roadmap-line" />
                <div className="roadmap-step done"><div className="roadmap-node"><CheckCircle2 size={17} /></div><div><strong>Discover your direction</strong><span>Career interests & target role</span></div><span className="step-status">Completed</span></div>
                <div className="roadmap-step current"><div className="roadmap-node"><Brain size={17} /></div><div><strong>Close your skill gaps</strong><span>Build role-ready fundamentals</span></div><span className="step-status">In progress</span></div>
                <div className="roadmap-step"><div className="roadmap-node"><FolderKanban size={17} /></div><div><strong>Build your portfolio</strong><span>Showcase practical experience</span></div><span className="step-status">Upcoming</span></div>
                <div className="roadmap-step"><div className="roadmap-node"><BriefcaseBusiness size={17} /></div><div><strong>Land your next role</strong><span>Interview, apply, and grow</span></div><span className="step-status">Upcoming</span></div>
              </div>
            </div>

            <div className="panel tasks-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">STAY ON TRACK</span><h2>Today's priorities</h2></div>
                <span className="task-count">{completed.filter(Boolean).length}/{tasks.length}</span>
              </div>
              <p className="panel-description">A little progress today goes a long way.</p>
              <div className="task-list">
                {tasks.map((task, index) => (
                  <button className={`task-item ${completed[index] ? "task-done" : ""}`} key={task} onClick={() => setCompleted(old => old.map((value, i) => i === index ? !value : value))}>
                    <span className="task-check">{completed[index] && <CheckCircle2 size={18} />}</span>
                    <span className="task-label">{task}</span>
                    <ChevronRight size={16} className="task-arrow" />
                  </button>
                ))}
              </div>
              <div className="task-footer"><Clock3 size={15} /> <span>Estimated time: 45 minutes</span></div>
            </div>
          </section>

          <footer className="footer"><span>© 2026 AscendAI</span><span>Built for your next chapter <Sparkles size={13} /></span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
