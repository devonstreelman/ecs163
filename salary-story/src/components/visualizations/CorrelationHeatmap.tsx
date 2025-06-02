'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ProcessedData, ChartDimensions } from '@/types/data';

interface CorrelationHeatmapProps {
  data: ProcessedData[];
  title: string;
  dimensions?: ChartDimensions;
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  data,
  title,
  dimensions = {
    width: 600,
    height: 500,
    margin: { top: 60, right: 40, bottom: 100, left: 100 }
  }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height, margin } = dimensions;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Define numeric fields for correlation
    const numericFields = [
      'Work_Experience',
      'GPA', 
      'Certifications',
      'Internships',
      'Job_Changes',
      'Networking_Score',
      'Salary_at_30'
    ];

    const fieldLabels: Record<string, string> = {
      'Work_Experience': 'Experience',
      'GPA': 'GPA',
      'Certifications': 'Certifications',
      'Internships': 'Internships',
      'Job_Changes': 'Job Changes',
      'Networking_Score': 'Networking',
      'Salary_at_30': 'Salary'
    };

    // Calculate correlation matrix
    const correlationMatrix: number[][] = [];
    
    numericFields.forEach((field1, i) => {
      correlationMatrix[i] = [];
      numericFields.forEach((field2, j) => {
        const values1 = data.map(d => Number(d[field1 as keyof ProcessedData]));
        const values2 = data.map(d => Number(d[field2 as keyof ProcessedData]));
        correlationMatrix[i][j] = pearsonCorrelation(values1, values2);
      });
    });

    // Create scales
    const xScale = d3.scaleBand()
      .domain(numericFields.map(f => fieldLabels[f]))
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(numericFields.map(f => fieldLabels[f]))
      .range([0, innerHeight])
      .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([1, -1]); // Reverse for better color mapping

    // Create main group
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-lg font-semibold fill-slate-100')
      .text(title);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip-heatmap')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))')
      .style('color', '#f1f5f9')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '14px')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('border', '1px solid rgba(148, 163, 184, 0.3)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('backdrop-filter', 'blur(8px)')
      .style('box-shadow', '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)');

    // Draw heatmap cells
    numericFields.forEach((field1, i) => {
      numericFields.forEach((field2, j) => {
        const correlation = correlationMatrix[i][j];
        const x = xScale(fieldLabels[field2])!;
        const y = yScale(fieldLabels[field1])!;

        // Cell rectangle
        g.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .style('fill', colorScale(correlation))
          .style('stroke', '#1e293b')
          .style('stroke-width', 1)
          .on('mouseover', function(event) {
            d3.select(this).style('stroke-width', 2);
            tooltip
              .style('visibility', 'visible')
              .style('top', `${event.pageY - 10}px`)
              .style('left', `${event.pageX + 10}px`)
              .html(`
                <div style="font-weight: 600; margin-bottom: 8px; color: #f8fafc;">${fieldLabels[field1]} vs ${fieldLabels[field2]}</div>
                <div style="display: grid; grid-template-columns: auto auto; gap: 8px 12px; line-height: 1.4;">
                  <div style="color: #cbd5e1;">Correlation:</div>
                  <div style="text-align: right; font-weight: 600; color: #fbbf24;">${correlation.toFixed(3)}</div>
                  <div style="color: #cbd5e1;">Strength:</div>
                  <div style="text-align: right; font-weight: 500; color: #34d399;">${getCorrelationStrength(Math.abs(correlation))}</div>
                </div>
              `);
          })
          .on('mousemove', function(event) {
            tooltip
              .style('top', `${event.pageY - 10}px`)
              .style('left', `${event.pageX + 10}px`);
          })
          .on('mouseout', function() {
            d3.select(this).style('stroke-width', 1);
            tooltip.style('visibility', 'hidden');
          });

        // Add correlation text
        g.append('text')
          .attr('x', x + xScale.bandwidth() / 2)
          .attr('y', y + yScale.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('class', 'text-xs font-medium')
          .style('fill', Math.abs(correlation) > 0.5 ? '#ffffff' : '#1e293b')
          .style('pointer-events', 'none')
          .text(correlation.toFixed(2));
      });
    });

    // Add X axis labels
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .selectAll('text')
      .data(numericFields.map(f => fieldLabels[f]))
      .enter()
      .append('text')
      .attr('x', d => xScale(d)! + xScale.bandwidth() / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm fill-slate-300')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', (d, i) => `rotate(-45, ${xScale(d)! + xScale.bandwidth() / 2}, 15)`)
      .text(d => d);

    // Add Y axis labels
    g.append('g')
      .selectAll('text')
      .data(numericFields.map(f => fieldLabels[f]))
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', d => yScale(d)! + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('class', 'text-sm fill-slate-300')
      .text(d => d);

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = innerWidth - legendWidth;
    const legendY = -40;

    const legendScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'));

    // Create gradient for legend
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'correlation-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');

    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const value = -1 + (2 * i / steps);
      gradient.append('stop')
        .attr('offset', `${(i / steps) * 100}%`)
        .attr('stop-color', colorScale(value));
    }

    // Legend rectangle
    g.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#correlation-gradient)')
      .style('stroke', '#475569')
      .style('stroke-width', 1);

    // Legend axis
    g.append('g')
      .attr('transform', `translate(${legendX}, ${legendY + legendHeight})`)
      .call(legendAxis)
      .attr('class', 'text-xs fill-slate-300');

    // Legend title
    g.append('text')
      .attr('x', legendX + legendWidth / 2)
      .attr('y', legendY - 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs fill-slate-300')
      .text('Correlation');

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.tooltip-heatmap').remove();
    };

  }, [data, title, dimensions]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      <svg ref={svgRef}></svg>
    </div>
  );
};

// Helper functions
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationStrength(correlation: number): string {
  if (correlation >= 0.7) return 'Very Strong';
  if (correlation >= 0.5) return 'Strong';
  if (correlation >= 0.3) return 'Moderate';
  if (correlation >= 0.1) return 'Weak';
  return 'Very Weak';
}

export default CorrelationHeatmap; 