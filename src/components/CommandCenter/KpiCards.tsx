import React from 'react';

export const KpiCards: React.FC = () => {
  return (
    <div className="command-kpi-grid">
      {/* CARD 1 — COHORTS */}
      <div className="exec-kpi-card">
        <div className="kpi-cat-header">
          <span className="kpi-cat-text">COHORTS</span>
        </div>
        <div className="kpi-metric-title">Active Bootcamps</div>
        <div className="kpi-main-val">4</div>
        <div className="kpi-support-desc">Graduate &amp; lateral programs</div>
        <div className="kpi-tech-list">Data Engineering · Power BI · SQL · Python</div>
        <div className="kpi-card-divider" />
        <div className="kpi-card-footer">
          <span className="kpi-trend-val positive">+1 this month</span>
          <svg className="kpi-spark-svg" viewBox="0 0 60 18">
            <path
              d="M2 14 L15 11 L30 13 L45 7 L58 3"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 2 — ENROLLMENT */}
      <div className="exec-kpi-card">
        <div className="kpi-cat-header">
          <span className="kpi-cat-text">ENROLLMENT</span>
        </div>
        <div className="kpi-metric-title">Total Trainees</div>
        <div className="kpi-main-val">96</div>
        <div className="kpi-support-desc">Across 4 active cohorts</div>
        <div className="kpi-card-divider" />
        <div className="kpi-card-footer">
          <span className="kpi-trend-val positive">+12 new intake</span>
          <svg className="kpi-spark-svg" viewBox="0 0 60 18">
            <path
              d="M2 15 L15 13 L30 9 L45 8 L58 2"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 3 — DEPLOYMENT */}
      <div className="exec-kpi-card">
        <div className="kpi-top-bar-accent teal" />
        <div className="kpi-cat-header">
          <span className="kpi-cat-text">DEPLOYMENT</span>
        </div>
        <div className="kpi-metric-title">Project Ready</div>
        <div className="kpi-main-val">58</div>
        <div className="kpi-support-desc">60.4% of enrolled talent</div>
        <div className="kpi-readiness-bar-track">
          <div className="kpi-readiness-bar-fill" style={{ width: '60.4%' }} />
        </div>
        <div className="kpi-card-divider" />
        <div className="kpi-card-footer">
          <span className="kpi-trend-val positive">+8 this week</span>
        </div>
      </div>

      {/* CARD 4 — RISK MONITOR */}
      <div className="exec-kpi-card exec-risk-card">
        <div className="kpi-top-bar-accent risk" />
        <div className="kpi-cat-header">
          <span className="kpi-risk-dot" />
          <span className="kpi-cat-text risk">RISK MONITOR</span>
        </div>
        <div className="kpi-metric-title">Need Attention</div>
        <div className="kpi-main-val risk">12</div>
        <div className="kpi-support-desc">Requires targeted intervention</div>
        <div className="kpi-card-divider" />
        <div className="kpi-card-footer">
          <span className="kpi-trend-val risk">3 resolved this period</span>
          <svg className="kpi-spark-svg" viewBox="0 0 60 18">
            <path
              d="M2 4 L18 6 L35 11 L58 16"
              fill="none"
              stroke="#e11d48"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 5 — QUALIFICATION */}
      <div className="exec-kpi-card">
        <div className="kpi-top-bar-accent teal" />
        <div className="kpi-cat-header">
          <span className="kpi-cat-text">QUALIFICATION</span>
        </div>
        <div className="kpi-metric-title">Certified Talent</div>
        <div className="kpi-main-val">37</div>
        <div className="kpi-support-desc">Azure · Databricks · Power BI</div>
        <div className="kpi-card-divider" />
        <div className="kpi-card-footer">
          <span className="kpi-trend-val positive">+5 this week</span>
          <svg className="kpi-spark-svg" viewBox="0 0 60 18">
            <path
              d="M2 15 L20 12 L38 8 L58 3"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 6 — VELOCITY */}
      <div className="exec-kpi-card">
        <div className="kpi-cat-header">
          <span className="kpi-cat-text">VELOCITY</span>
        </div>
        <div className="kpi-metric-title">Avg Learning Progress</div>
        <div className="kpi-main-val">81%</div>
        <div className="kpi-support-desc">Curriculum completion</div>
        <div className="kpi-card-divider" />
        <div className="kpi-card-footer">
          <span className="kpi-trend-val positive">+4.2% overall</span>
          <svg className="kpi-spark-svg" viewBox="0 0 60 18">
            <path
              d="M2 16 L15 13 L30 11 L45 6 L58 2"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default KpiCards;
