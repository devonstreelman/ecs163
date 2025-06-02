'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ProcessedData, ChartDimensions } from '@/types/data';

interface ScatterPlotProps {
  data: ProcessedData[];
  xField: keyof ProcessedData;
  yField: keyof ProcessedData;
  colorField?: keyof ProcessedData;
  title: string;
  xLabel: string;
  yLabel: string;
  dimensions?: ChartDimensions;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  xField,
  yField,
  colorField,
  title,
  xLabel,
  yLabel,
  dimensions = {
    width: 600,
    height: 400,
    margin: { top: 40, right: 80, bottom: 60, left: 80 }
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

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => Number(d[xField])) as [number, number])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => Number(d[yField])) as [number, number])
      .range([innerHeight, 0])
      .nice();

    // Color scale
    const colorScale = colorField 
      ? d3.scaleOrdinal(d3.schemeCategory10)
          .domain([...new Set(data.map(d => String(d[colorField])))])
      : () => '#3b82f6';

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
      .attr('class', 'text-slate-300');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('class', 'text-slate-300');

    // Add X axis label
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
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
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Create tooltip first
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip-scatterplot')
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

    // Add dots
    const dots = g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(Number(d[xField])))
      .attr('cy', d => yScale(Number(d[yField])))
      .attr('r', 4)
      .style('fill', d => colorField ? colorScale(String(d[colorField])) : '#3b82f6')
      .style('opacity', 0.7)
      .style('stroke', '#1e293b')
      .style('stroke-width', 1);

    // Calculate and add line of best fit
    const xValues = data.map(d => Number(d[xField]));
    const yValues = data.map(d => Number(d[yField]));
    
    // Simple linear regression
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSS = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const residualSS = yValues.reduce((sum, y, i) => {
      const yPred = slope * xValues[i] + intercept;
      return sum + Math.pow(y - yPred, 2);
    }, 0);
    const rSquared = 1 - (residualSS / totalSS);

    // Add line of best fit
    const lineGroup = g.append('g')
      .attr('class', 'regression-line')
      .style('opacity', 1);

    lineGroup.append('line')
      .attr('x1', xScale(d3.min(xValues)!))
      .attr('x2', xScale(d3.max(xValues)!))
      .attr('y1', yScale(slope * d3.min(xValues)! + intercept))
      .attr('y2', yScale(slope * d3.max(xValues)! + intercept))
      .style('stroke', '#ef4444')
      .style('stroke-width', 6);

    // Format salary value for tooltip
    const formatSalary = (value: number) => {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    dots
      .on('mouseover', function(event, d) {
        d3.select(this)
          .style('opacity', 1)
          .style('stroke-width', 2);
        
        tooltip
          .style('visibility', 'visible')
          .style('top', `${event.pageY - 10}px`)
          .style('left', `${event.pageX + 10}px`)
          .html(`
            <div style="font-weight: 600; margin-bottom: 8px; color: #f8fafc;">${title}</div>
            <div style="display: grid; grid-template-columns: auto auto; gap: 8px 12px; line-height: 1.4;">
              <div style="color: #cbd5e1;">${xLabel}:</div>
              <div style="text-align: right; font-weight: 500; color: #f1f5f9;">${Number(d[xField]).toFixed(2)}</div>
              <div style="color: #cbd5e1;">${yLabel}:</div>
              <div style="text-align: right; font-weight: 500; color: #f1f5f9;">${formatSalary(Number(d[yField]))}</div>
              ${colorField ? `
                <div style="color: #cbd5e1;">${String(colorField)}:</div>
                <div style="text-align: right; font-weight: 500; color: #f1f5f9;">${d[colorField]}</div>
              ` : ''}
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
          .style('opacity', 0.7)
          .style('stroke-width', 1);
        
        tooltip.style('visibility', 'hidden');
      });

    // Add legend if color field is provided
    if (colorField) {
      const legendData = [...new Set(data.map(d => String(d[colorField])))];
      const legend = g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${innerWidth + 20}, 20)`);

      const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter().append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);

      legendItems.append('circle')
        .attr('r', 6)
        .style('fill', d => colorScale(d));

      legendItems.append('text')
        .attr('x', 15)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .attr('class', 'text-xs fill-slate-300')
        .text(d => d);
    }

    // Cleanup function
    return () => {
      d3.select('body').selectAll('.tooltip-scatterplot').remove();
    };

  }, [data, xField, yField, colorField, title, xLabel, yLabel, dimensions]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ScatterPlot; 