# Salary Story: Interactive Salary Analysis Dashboard

## Description

Salary Story is a modern, interactive data visualization dashboard built with Next.js and D3.js that analyzes various factors influencing salaries. The project provides deep insights into how different variables such as work experience, education, GPA, and industry choices affect salary outcomes.

The dashboard features several sophisticated visualizations:

1. **Box Plots**: Show salary distributions across different categories (education levels and industries), highlighting medians, quartiles, and outliers.

2. **Scatter Plots**: Demonstrate relationships between numerical variables, with interactive regression lines and detailed tooltips.

3. **Correlation Heatmap**: Displays the strength and direction of relationships between all numerical variables in the dataset.

4. **Parallel Coordinates Plot**: An advanced visualization that allows users to explore multivariate relationships by dragging over axes, making it easy to identify patterns and clusters in the data.

All visualizations feature modern design elements including:
- Glass morphism effects with backdrop blur
- Gradient backgrounds and animations
- Interactive tooltips with detailed information
- Smooth hover effects and transitions
- Color-coded data presentation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/devonstreelman/ecs163.git
cd salary-story
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Features

- **Interactive Visualizations**: All charts are interactive with hover effects and tooltips
- **Responsive Design**: Adapts to different screen sizes
- **Modern UI**: Implements latest design trends with glass morphism and gradients
- **Type Safety**: Built with TypeScript for better development experience
- **Performance Optimized**: Uses Next.js for optimal performance and SEO

## Technologies Used

- Next.js 14
- D3.js
- TypeScript
- Tailwind CSS

## Data Analysis Insights

The visualizations reveal several key insights about salary determinants:

1. Work Experience (r=0.90) shows the strongest correlation with salary
2. Educational factors like GPA (r=0.08) show surprisingly weak correlations
3. Industry choice has a significant impact on salary distributions
4. Multiple factors together provide better salary predictions than any single factor

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
