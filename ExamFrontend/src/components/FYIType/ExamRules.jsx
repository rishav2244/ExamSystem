import styles from "../../pages/css/CandidateExamSetup.module.css"

export const ExamRules = ({ onAccept }) => {
  const rules = [
    {
      icon: "🚫",
      title: "No Secondary Actions",
      description: "Right-clicking, copying, and pasting are strictly disabled and monitored as violations."
    },
    {
      icon: "🖥️",
      title: "Fullscreen Required",
      description: "The exam must be taken in fullscreen mode. Exiting fullscreen will trigger an alert."
    },
    {
      icon: "🔲",
      title: "No Tab Switching",
      description: "Do not switch tabs or windows. Navigating away from the exam page will be flagged."
    },
    {
      icon: "📸",
      title: "Proctored Environment",
      description: "Continuous camera and microphone monitoring is active to ensure the integrity of the session."
    }
  ];

  return (
    <div className={styles.StepFadeIn}>
      <h2 className={styles.SetupTitle}>Examination Rules</h2>
      <p className={styles.InstructionsSub}>
        Please review the proctoring guidelines carefully. Failure to follow these rules may lead to disqualification.
      </p>

      <div className={styles.RulesGrid}>
        {rules.map((rule, index) => (
          <div key={index} className={styles.RuleItem}>
            <span className={styles.RuleIcon}>{rule.icon}</span>
            <div>
              <strong>{rule.title}</strong>
              <p>{rule.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.FinalStartButton} onClick={onAccept}>
        I Understand, Proceed to System Check
      </button>
    </div>
  );
};