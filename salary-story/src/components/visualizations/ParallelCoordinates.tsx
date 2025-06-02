'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ProcessedData, ChartDimensions } from '@/types/data';

interface ParallelCoordinatesProps {
  data: ProcessedData[];
  title: string;
  chartDimensions?: ChartDimensions;
}

const ParallelCoordinates: React.FC<ParallelCoordinatesProps> = ({
  data,
  title,
  chartDimensions = {
    width: 900,
    height: 500,
    margin: { top: 50, right: 50, bottom: 30, left: 50 }
  }
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height, margin } = chartDimensions;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Define dimensions to visualize
    const dimensions = [
      'Work_Experience',
      'GPA',
      'Certifications',
      'Internships',
      'Job_Changes',
      'Networking_Score',
      'Salary_at_30'
    ];

    const dimensionLabels: Record<string, string> = {
      'Work_Experience': 'Experience',
      'GPA': 'GPA',
      'Certifications': 'Certifications',
      'Internships': 'Internships',
      'Job_Changes': 'Job Changes',
      'Networking_Score': 'Networking',
      'Salary_at_30': 'Salary'
    };

    // Create scales for each dimension
    const y: { [key: string]: d3.ScaleLinear<number, number> } = {};
    dimensions.forEach(dimension => {
      y[dimension] = d3.scaleLinear()
        .domain(d3.extent(data, d => Number(d[dimension as keyof ProcessedData])) as [number, number])
        .range([innerHeight, 0])
        .nice();
    });

    // Create x scale for dimensions
    const x = d3.scalePoint()
      .range([0, innerWidth])
      .domain(dimensions);

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
      .attr('class', 'tooltip-parallel')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))')
      .style('color', '#f1f5f9')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '11px')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('border', '1px solid rgba(148, 163, 184, 0.3)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('backdrop-filter', 'blur(8px)')
      .style('box-shadow', '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)');

    // Format salary value for tooltip
    const formatSalary = (value: number) => {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Format value based on dimension
    const formatValue = (dimension: string, value: number) => {
      if (dimension === 'Salary_at_30') return formatSalary(value);
      if (dimension === 'GPA') return value.toFixed(2);
      return value.toString();
    };

    // Draw the lines
    const line = d3.line()
      .defined((d: any) => !isNaN(d[1]))
      .x((d: any) => d[0])
      .y((d: any) => d[1]);

    const path = g.append('g')
      .attr('class', 'lines')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', d => {
        return line(dimensions.map(p => {
          const value = Number(d[p as keyof ProcessedData]);
          return [x(p)!, y[p](value)];
        }));
      })
      .style('fill', 'none')
      .style('stroke', '#3b82f6')
      .style('stroke-width', 1.5)
      .style('opacity', 0.3)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .style('stroke', '#f59e0b')
          .style('stroke-width', 3)
          .style('opacity', 1)
          .raise();

        tooltip
          .style('visibility', 'visible')
          .style('top', `${event.pageY - 10}px`)
          .style('left', `${event.pageX + 10}px`)
          .html(`
            <div style="font-weight: 600; margin-bottom: 8px; color: #f8fafc;">Profile Details</div>
            <div style="display: grid; grid-template-columns: auto auto; gap: 8px 12px; line-height: 1.4;">
              ${dimensions.map(dim => `
                <div style="color: #cbd5e1;">${dimensionLabels[dim]}:</div>
                <div style="text-align: right; font-weight: 500; color: #f1f5f9;">
                  ${formatValue(dim, Number(d[dim as keyof ProcessedData]))}
                </div>
              `).join('')}
              <div style="color: #cbd5e1;">Education:</div>
              <div style="text-align: right; font-weight: 500; color: #34d399;">${d.education}</div>
              <div style="color: #cbd5e1;">Industry:</div>
              <div style="text-align: right; font-weight: 500; color: #a78bfa;">${d.industry}</div>
            </div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', `${event.pageY - 10}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('stroke', '#3b82f6')
          .style('stroke-width', 1.5)
          .style('opacity', 0.3);
        
        tooltip.style('visibility', 'hidden');
      });

    // Add a group element for each dimension.
    const dimension = g.selectAll('.dimension')
      .data(dimensions)
      .enter().append('g')
      .attr('class', 'dimension')
      .attr('transform', d => `translate(${x(d)!},0)`);

    // Add labels
    dimension.append('text')
      .attr('y', -10)
      .attr('class', 'text-xs fill-slate-300')
      .style('text-anchor', 'middle')
      .text(d => dimensionLabels[d]);

    // Add axes
    dimension.append('g')
      .attr('class', 'axis')
      .each(function(d) {
        d3.select(this).call(d3.axisLeft(y[d]).ticks(5));
      })
      .attr('class', 'text-slate-300');

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.tooltip-parallel').remove();
    };

  }, [data, title, chartDimensions]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ParallelCoordinates;