'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ProcessedData, ChartDimensions } from '@/types/data';

interface BoxPlotProps {
  data: ProcessedData[];
  groupField: keyof ProcessedData;
  valueField: keyof ProcessedData;
  title: string;
  xLabel: string;
  yLabel: string;
  dimensions?: ChartDimensions;
}

const BoxPlot: React.FC<BoxPlotProps> = ({
  data,
  groupField,
  valueField,
  title,
  xLabel,
  yLabel,
  dimensions = {
    width: 600,
    height: 400,
    margin: { top: 40, right: 40, bottom: 80, left: 80 }
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

    // Group data by the specified field
    const groupedData = d3.group(data, d => String(d[groupField]));
    const groups = Array.from(groupedData.keys());

    // Calculate box plot statistics for each group
    const boxData = groups.map(group => {
      const values = groupedData.get(group)!
        .map(d => Number(d[valueField]))
        .sort(d3.ascending);
      
      const q1 = d3.quantile(values, 0.25)!;
      const median = d3.quantile(values, 0.5)!;
      const q3 = d3.quantile(values, 0.75)!;
      const iqr = q3 - q1;
      const min = Math.max(d3.min(values)!, q1 - 1.5 * iqr);
      const max = Math.min(d3.max(values)!, q3 + 1.5 * iqr);
      
      // Find outliers
      const outliers = values.filter(v => v < min || v > max);
      
      return {
        group,
        q1,
        median,
        q3,
        min,
        max,
        outliers,
        values
      };
    });

    // Create scales
    const xScale = d3.scaleBand()
      .domain(groups.sort())
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([
        Math.min(0, d3.min(data, d => Number(d[valueField])) ?? 0) * 0.95,
        Math.max(0, d3.max(data, d => Number(d[valueField])) ?? 0) * 1.05
      ])
      .range([innerHeight, 0])
      .nice();

    // Color scale with specific colors for education and industry
    const educationColors = {
      'High School': '#60a5fa', // blue-400
      'Master': '#34d399', // emerald-400
      'PhD': '#a78bfa' // violet-400
    };

    const industryColors = {
      'Finance': '#f472b6', // pink-400
      'Healthcare': '#2dd4bf', // teal-400
      'Retail': '#fb923c', // orange-400
      'Tech': '#a78bfa' // violet-400
    };

    const colorScale = (group: string) => {
      if (groupField === 'education' && group in educationColors) {
        return educationColors[group as keyof typeof educationColors];
      }
      if (groupField === 'industry' && group in industryColors) {
        return industryColors[group as keyof typeof industryColors];
      }
      return d3.schemeCategory10[0];
    };

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

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('class', 'text-slate-300')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('class', 'text-slate-300');

    // Add X axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 65)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm fill-slate-300')
      .text(xLabel);

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm fill-slate-300')
      .text(yLabel);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip-boxplot')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))')
      .style('color', '#f1f5f9')
      .style('padding', '16px')
      .style('border-radius', '12px')
      .style('font-size', '14px')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .style('border', '1px solid rgba(148, 163, 184, 0.3)')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '320px')
      .style('backdrop-filter', 'blur(8px)')
      .style('box-shadow', '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)');

    // Draw box plots
    const boxWidth = xScale.bandwidth() * 0.6;
    
    boxData.forEach(box => {
      const x = xScale(box.group)! + xScale.bandwidth() / 2;
      const color = colorScale(box.group);

      // Create group for each box plot
      const boxGroup = g.append('g')
        .attr('class', 'box-plot-group')
        .style('cursor', 'pointer');

      // Format salary value for tooltip
      const formatSalary = (value: number) => {
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      // Vertical line from min to max
      boxGroup.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', yScale(box.min))
        .attr('y2', yScale(box.max))
        .style('stroke', color)
        .style('stroke-width', 2);

      // Box (IQR)
      boxGroup.append('rect')
        .attr('x', x - boxWidth / 2)
        .attr('y', yScale(box.q3))
        .attr('width', boxWidth)
        .attr('height', yScale(box.q1) - yScale(box.q3))
        .style('fill', color)
        .style('opacity', 0.7)
        .style('stroke', color)
        .style('stroke-width', 2);

      // Median line
      boxGroup.append('line')
        .attr('x1', x - boxWidth / 2)
        .attr('x2', x + boxWidth / 2)
        .attr('y1', yScale(box.median))
        .attr('y2', yScale(box.median))
        .style('stroke', '#1e293b')
        .style('stroke-width', 3);

      // Min and max lines
      boxGroup.append('line')
        .attr('x1', x - boxWidth / 4)
        .attr('x2', x + boxWidth / 4)
        .attr('y1', yScale(box.min))
        .attr('y2', yScale(box.min))
        .style('stroke', color)
        .style('stroke-width', 2);

      boxGroup.append('line')
        .attr('x1', x - boxWidth / 4)
        .attr('x2', x + boxWidth / 4)
        .attr('y1', yScale(box.max))
        .attr('y2', yScale(box.max))
        .style('stroke', color)
        .style('stroke-width', 2);

      // Outliers
      boxGroup.selectAll(`.outlier-${box.group}`)
        .data(box.outliers)
        .enter().append('circle')
        .attr('class', `outlier-${box.group}`)
        .attr('cx', x)
        .attr('cy', d => yScale(d))
        .attr('r', 3)
        .style('fill', color)
        .style('opacity', 0.8)
        .style('stroke', '#1e293b')
        .style('stroke-width', 1);

      // Add invisible rect for hover
      boxGroup.append('rect')
        .attr('x', x - boxWidth / 2)
        .attr('y', yScale(box.max))
        .attr('width', boxWidth)
        .attr('height', yScale(box.min) - yScale(box.max))
        .style('fill', 'transparent')
        .style('pointer-events', 'all')
        .on('mouseover', function(event: MouseEvent) {
          // Highlight the box plot
          const parent = d3.select(this.parentNode as Element);
          parent.selectAll('rect, line, circle')
            .style('opacity', 1)
            .style('stroke-width', function() {
              return d3.select(this).classed('median') ? 3 : 2;
            });

          // Show tooltip
          tooltip
            .style('visibility', 'visible')
            .style('top', `${event.pageY - 10}px`)
            .style('left', `${event.pageX + 10}px`)
            .html(`
              <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px; color: #f8fafc;">${box.group}</div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px 16px; line-height: 1.5;">
                <div style="color: #cbd5e1;">Maximum:</div>
                <div style="text-align: right; font-weight: 500; color: #f1f5f9;">${formatSalary(box.max)}</div>
                <div style="color: #cbd5e1;">Upper Quartile:</div>
                <div style="text-align: right; font-weight: 500; color: #f1f5f9;">${formatSalary(box.q3)}</div>
                <div style="color: #cbd5e1;">Median:</div>
                <div style="text-align: right; font-weight: 600; color: #fbbf24;">${formatSalary(box.median)}</div>
                <div style="color: #cbd5e1;">Lower Quartile:</div>
                <div style="text-align: right; font-weight: 500; color: #f1f5f9;">${formatSalary(box.q1)}</div>
                <div style="color: #cbd5e1;">Minimum:</div>
                <div style="text-align: right; font-weight: 500; color: #f1f5f9;">${formatSalary(box.min)}</div>
                <div style="color: #cbd5e1;">Count:</div>
                <div style="text-align: right; font-weight: 500; color: #34d399;">${box.values.length}</div>
              </div>
            `);
        })
        .on('mousemove', function(event: MouseEvent) {
          tooltip
            .style('top', `${event.pageY - 10}px`)
            .style('left', `${event.pageX + 10}px`);
        })
        .on('mouseout', function() {
          // Reset box plot appearance
          const parent = d3.select(this.parentNode as Element);
          parent.selectAll('rect, line')
            .style('opacity', function() {
              return d3.select(this).classed('median') ? 1 : 0.7;
            })
            .style('stroke-width', function() {
              return d3.select(this).classed('median') ? 3 : 2;
            });

          // Hide tooltip
          tooltip.style('visibility', 'hidden');
        });

      // Add class to median line for proper styling
      boxGroup.select('line[y1="' + yScale(box.median) + '"]')
        .classed('median', true);
    });

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.tooltip-boxplot').remove();
    };

  }, [data, groupField, valueField, title, xLabel, yLabel, dimensions]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BoxPlot; 