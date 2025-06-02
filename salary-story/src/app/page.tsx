'use client';

import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import Layout from '@/components/Layout';
import ScatterPlot from '@/components/visualizations/ScatterPlot';
import BoxPlot from '@/components/visualizations/BoxPlot';
import CorrelationHeatmap from '@/components/visualizations/CorrelationHeatmap';
import ParallelCoordinates from '@/components/visualizations/ParallelCoordinates';
import { ProcessedData } from '@/types/data';
import { processRawData, calculateStatistics, groupByEducation, groupByIndustry } from '@/utils/dataProcessing';

export default function Home() {
  const [data, setData] = useState<ProcessedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await d3.csv('/data.csv');
        const processedData = processRawData(csvData);
        
        // Debug logging
        console.log('First few rows of processed data:', processedData.slice(0, 5));
        
        // Count education levels
        const educationCounts = processedData.reduce((acc, item) => {
          acc[item.education] = (acc[item.education] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('Education level counts:', educationCounts);
        
        // Count industries
        const industryCounts = processedData.reduce((acc, item) => {
          acc[item.industry] = (acc[item.industry] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('Industry counts:', industryCounts);
        
        setData(processedData);
        setStats(calculateStatistics(processedData));
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-border mx-auto"></div>
              <div className="absolute inset-2 bg-slate-900 rounded-full"></div>
              <div className="absolute inset-4 animate-pulse bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20"></div>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                Loading Salary Data
              </h2>
              <p className="text-slate-300 animate-pulse">Analyzing career trajectories...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const educationGroups = groupByEducation(data);
  const industryGroups = groupByIndustry(data);

  return (
    <Layout>
      {/* INTRO SECTION - Wide Opening (Martini Glass Top) */}
      <section id="intro" className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-8 animate-gradient-x">
                The Salary Story
              </h1>
              <p className="text-2xl md:text-3xl text-slate-300 mb-12 leading-relaxed animate-fade-in-up delay-300">
                What determines your salary at 30? Explore the hidden patterns in career success.
              </p>
            </div>
            
            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 animate-fade-in-up delay-500">
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="text-3xl font-bold text-blue-400 animate-count-up">{stats?.count.toLocaleString()}</div>
                <div className="text-slate-300">Professionals</div>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                <div className="text-3xl font-bold text-green-400">${stats?.mean.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                <div className="text-slate-300">Avg Salary</div>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="text-3xl font-bold text-purple-400">${stats?.max.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                <div className="text-slate-300">Highest</div>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
                <div className="text-3xl font-bold text-orange-400">${stats?.min.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                <div className="text-slate-300">Lowest</div>
              </div>
            </div>

            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 animate-fade-in-up delay-700">
              <div className="transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20">
                <BoxPlot
                  data={data}
                  groupField="education"
                  valueField="Salary_at_30"
                  title="Salary Distribution by Education Level"
                  xLabel="Education Level"
                  yLabel="Salary at 30"
                  dimensions={{ width: 500, height: 350, margin: { top: 40, right: 40, bottom: 80, left: 80 } }}
                />
                <div className="mt-4 text-sm text-slate-400 text-center bg-slate-800/20 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                  Compare salary ranges across High School, Master's, and PhD education levels
                </div>
              </div>
              <div className="transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
                <BoxPlot
                  data={data}
                  groupField="industry"
                  valueField="Salary_at_30"
                  title="Salary Distribution by Industry"
                  xLabel="Industry"
                  yLabel="Salary at 30"
                  dimensions={{ width: 500, height: 350, margin: { top: 40, right: 40, bottom: 80, left: 80 } }}
                />
                <div className="mt-4 text-sm text-slate-400 text-center bg-slate-800/20 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                  Compare salary ranges in Finance, Healthcare, Retail, and Tech sectors
                </div>
              </div>
            </div>

            <div className="text-lg text-slate-400 mb-8 animate-fade-in-up delay-900">
              The data reveals striking patterns across education levels and industries. 
              But what factors truly drive these differences?
            </div>

            <div className="animate-fade-in-up delay-1000">
              <a 
                href="#hero" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 animate-pulse-glow"
              >
                Dive Deeper
                <svg className="ml-2 w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HERO SECTION - Narrow Stem (Martini Glass Middle) */}
      <section id="hero" className="min-h-screen bg-slate-50 text-slate-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                The Core Analysis
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Let's examine the key relationships that determine salary outcomes. 
                Each visualization tells part of the story.
              </p>
            </div>

            {/* Core Visualizations */}
            <div className="space-y-16">
              {/* Experience vs Salary */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Experience Drives Success</h3>
                  <p className="text-slate-600">
                    With a correlation of 0.90, work experience emerges as the dominant factor in salary determination. 
                    The relationship is strongly linear, showing consistent returns for each year of experience.
                  </p>
                </div>
                <ScatterPlot
                  data={data}
                  xField="Work_Experience"
                  yField="Salary_at_30"
                  colorField="education"
                  title="Salary vs Work Experience"
                  xLabel="Years of Work Experience"
                  yLabel="Salary at 30"
                  dimensions={{ width: 700, height: 400, margin: { top: 40, right: 120, bottom: 60, left: 80 } }}
                />
              </div>

              {/* GPA vs Salary */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Academic Impact Limited</h3>
                  <p className="text-slate-600">
                    Despite common beliefs, GPA shows only a minimal correlation with salary (r = 0.08), 
                    suggesting that post-graduation success depends more on other factors.
                  </p>
                </div>
                <ScatterPlot
                  data={data}
                  xField="GPA"
                  yField="Salary_at_30"
                  colorField="industry"
                  title="Salary vs GPA"
                  xLabel="GPA"
                  yLabel="Salary at 30"
                  dimensions={{ width: 700, height: 400, margin: { top: 40, right: 120, bottom: 60, left: 80 } }}
                />
              </div>

              {/* Networking vs Salary */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Networking Context</h3>
                  <p className="text-slate-600">
                    Professional networking shows a modest correlation (r = 0.11) with salary outcomes, 
                    indicating it may be a supporting rather than primary factor in career growth.
                  </p>
                </div>
                <ScatterPlot
                  data={data}
                  xField="Networking_Score"
                  yField="Salary_at_30"
                  colorField="location"
                  title="Salary vs Networking Score"
                  xLabel="Networking Score"
                  yLabel="Salary at 30"
                  dimensions={{ width: 700, height: 400, margin: { top: 40, right: 120, bottom: 60, left: 80 } }}
                />
              </div>

              {/* Correlation Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">The Complete Picture</h3>
                  <p className="text-slate-600">
                    This correlation matrix reveals how all factors interact. The strongest predictors 
                    of salary success become clear.
                  </p>
                </div>
                <div className="flex justify-center">
                  <CorrelationHeatmap
                    data={data}
                    title="Variable Correlations"
                    dimensions={{ width: 650, height: 500, margin: { top: 60, right: 40, bottom: 100, left: 120 } }}
                  />
                </div>
              </div>

              {/* Advanced Analysis: Parallel Coordinates */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Interactive Multi-Factor Analysis</h3>
                  <p className="text-slate-600">
                    Explore how multiple factors work together to influence salary outcomes. Each line represents 
                    an individual's career profile, highlighting the complex interplay between experience, 
                    education, networking, and other factors.
                  </p>
                  <div className="mt-4 text-sm text-slate-500">
                    <strong>Pro Tips:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Hover over any line to see detailed information about that career profile</li>
                      <li>Look for parallel or crossing patterns to identify relationships between variables</li>
                      <li>Notice how high-salary profiles tend to show similar patterns across multiple factors</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-center w-full overflow-x-auto">
                  <div className="min-w-[700px]">
                    <ParallelCoordinates
                      data={data}
                      title="Multi-Factor Career Analysis"
                      chartDimensions={{ width: 700, height: 400, margin: { top: 50, right: 30, bottom: 30, left: 30 } }}
                    />
                  </div>
                </div>
                <div className="mt-6 text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                  This advanced visualization reveals complex relationships that might be missed in simpler charts. 
                  For example, you can identify clusters of high-salary individuals and see what combinations of 
                  factors they share, or spot unusual career paths that led to success.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TAKEAWAYS SECTION - Wide Closing (Martini Glass Bottom) */}
      <section id="takeaways" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
                Key Insights
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                What we learned from analyzing thousands of career trajectories
              </p>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700 hover:border-blue-500 transition-colors duration-300">
                <div className="text-3xl mb-4">💼</div>
                <h3 className="text-xl font-bold text-blue-400 mb-4">Experience Dominates</h3>
                <p className="text-slate-300">
                  Work experience has an exceptionally strong correlation with salary (r = 0.90), 
                  making it by far the strongest predictor of earnings.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700 hover:border-green-500 transition-colors duration-300">
                <div className="text-3xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-green-400 mb-4">Academic Performance</h3>
                <p className="text-slate-300">
                  GPA shows a surprisingly weak correlation with salary (r = 0.08), suggesting 
                  that academic performance alone has minimal direct impact on earnings.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700 hover:border-purple-500 transition-colors duration-300">
                <div className="text-3xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-purple-400 mb-4">Professional Development</h3>
                <p className="text-slate-300">
                  Certifications (r = 0.14) and internships (r = 0.13) show weak but positive 
                  correlations with salary outcomes.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700 hover:border-orange-500 transition-colors duration-300">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-orange-400 mb-4">Career Mobility</h3>
                <p className="text-slate-300">
                  Job changes (r = 0.10) and networking (r = 0.11) show weak correlations with salary, 
                  suggesting their impact might be more situational.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700 hover:border-yellow-500 transition-colors duration-300">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Additional Factors</h3>
                <p className="text-slate-300">
                  Certifications (r = 0.14), internships (r = 0.13), and GPA (r = 0.08) 
                  show weak correlations with salary outcomes.
                </p>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-blue-400 mb-6 text-center">Your Career Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">For Early Career:</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Prioritize gaining quality work experience - the strongest predictor (r = 0.90)
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Pursue certifications and internships for modest advantages
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Focus on skill development over GPA optimization
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Build professional relationships gradually
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">For Career Growth:</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Maximize the quality and relevance of work experience
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Consider strategic job changes when opportunities arise
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Maintain professional networks while focusing on performance
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      Balance certification pursuit with practical experience
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <p className="text-lg text-slate-400 mb-8">
                The data clearly shows that work experience is the key driver of salary growth, 
                while other factors play supporting roles with varying degrees of impact.
              </p>
              <a 
                href="#intro" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                Explore Again
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </a>
            </div>
          </div>
    </div>
      </section>
    </Layout>
  );
}
