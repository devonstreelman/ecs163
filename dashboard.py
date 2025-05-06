import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from dash import Dash, html, dcc
from dash.dependencies import Input, Output
import numpy as np

# Read the data
df = pd.read_csv('salary_at_30_years_of_age.csv')

# Initialize the Dash app
app = Dash(__name__)

# Modern color scheme
colors = {
    'background': '#0f172a',  # Dark blue background
    'text': '#e2e8f0',        # Light gray text
    'grid': '#1e293b',        # Slightly lighter grid
    'plot_bg': '#1e293b',     # Dark blue plot background
    'paper_bg': '#0f172a',    # Dark blue paper background
    'accent': '#3b82f6',      # Blue accent color
    'success': '#10b981',     # Green for positive values
    'warning': '#f59e0b',     # Yellow for neutral values
    'danger': '#ef4444'       # Red for negative values
}

# Color palettes
education_colors = px.colors.qualitative.Pastel[:3]  # 3 colors for education levels
industry_colors = px.colors.qualitative.Pastel[3:7]  # 4 colors for industries
location_colors = px.colors.qualitative.Pastel[7:11] # 4 colors for locations

# Modern font settings
font_settings = {
    'family': 'Inter, system-ui, -apple-system, sans-serif',
    'size': 14,
    'color': colors['text']
}

# Create the layout
app.layout = html.Div([
    html.Div([
        html.H1("Salary Analysis Dashboard", 
                style={'textAlign': 'center', 
                      'color': colors['text'],
                      'padding': '20px',
                      'fontFamily': font_settings['family'],
                      'fontSize': '2.5em',
                      'fontWeight': 'bold',
                      'marginBottom': '20px'}),
        html.P("Interactive analysis of salary factors at age 30",
               style={'textAlign': 'center',
                     'color': colors['text'],
                     'fontFamily': font_settings['family'],
                     'marginBottom': '40px'})
    ]),
    
    # First row with three graphs
    html.Div([
        # Salary distribution by education level
        dcc.Graph(id='education-salary-box'),
        
        # Salary distribution by industry
        dcc.Graph(id='industry-salary-box'),
        
        # Salary distribution by location
        dcc.Graph(id='location-salary-box')
    ], style={'display': 'flex', 'flexDirection': 'row', 'padding': '20px', 'gap': '20px'}),
    
    # Second row with three graphs
    html.Div([
        # Salary vs Work Experience scatter plot
        dcc.Graph(id='experience-salary-scatter'),
        
        # Salary vs GPA scatter plot
        dcc.Graph(id='gpa-salary-scatter'),
        
        # Salary vs Certifications scatter plot
        dcc.Graph(id='certifications-salary-scatter')
    ], style={'display': 'flex', 'flexDirection': 'row', 'padding': '20px', 'gap': '20px'}),
    
    # Third row with two graphs
    html.Div([
        # 3D Scatter plot of Work Experience, GPA, and Salary
        dcc.Graph(id='3d-scatter'),
        
        # Heatmap of correlations
        dcc.Graph(id='correlation-heatmap')
    ], style={'display': 'flex', 'flexDirection': 'row', 'padding': '20px', 'gap': '20px'})
], style={'backgroundColor': colors['background'], 'minHeight': '100vh', 'padding': '20px'})

def update_plot_theme(fig):
    fig.update_layout(
        plot_bgcolor=colors['plot_bg'],
        paper_bgcolor=colors['paper_bg'],
        font=font_settings,
        xaxis=dict(
            gridcolor=colors['grid'],
            linecolor=colors['grid'],
            zerolinecolor=colors['grid']
        ),
        yaxis=dict(
            gridcolor=colors['grid'],
            linecolor=colors['grid'],
            zerolinecolor=colors['grid']
        ),
        margin=dict(l=50, r=50, t=50, b=50),
        hovermode='x unified',
        hoverlabel=dict(
            bgcolor=colors['plot_bg'],
            font_size=12,
            font_family=font_settings['family']
        )
    )
    return fig

# Callback for education level salary box plot
@app.callback(
    Output('education-salary-box', 'figure'),
    Input('education-salary-box', 'relayoutData')
)
def update_education_salary_box(relayoutData):
    education_levels = ['High School', 'Master', 'PhD']
    education_data = []
    
    for level in education_levels:
        education_data.append(df[df[f'Education_{level}'] == True]['Salary_at_30'])
    
    fig = go.Figure()
    for i, level in enumerate(education_levels):
        fig.add_trace(go.Box(
            y=education_data[i],
            name=level,
            boxpoints='outliers',
            marker_color=education_colors[i % len(education_colors)],
            line_color='white',
            fillcolor=education_colors[i % len(education_colors)],
            opacity=0.8,
            line=dict(width=2),
            boxmean=True,  # Show mean line
            whiskerwidth=0.8,
            marker=dict(size=5, opacity=0.7)
        ))
    
    fig.update_layout(
        title='Salary Distribution by Education Level',
        yaxis_title='Salary at 30',
        showlegend=True,
        boxmode='group',
        boxgap=0.3
    )
    return update_plot_theme(fig)

# Callback for industry salary box plot
@app.callback(
    Output('industry-salary-box', 'figure'),
    Input('industry-salary-box', 'relayoutData')
)
def update_industry_salary_box(relayoutData):
    industries = ['Finance', 'Healthcare', 'Retail', 'Tech']
    industry_data = []
    
    for industry in industries:
        industry_data.append(df[df[f'Industry_{industry}'] == True]['Salary_at_30'])
    
    fig = go.Figure()
    for i, industry in enumerate(industries):
        fig.add_trace(go.Box(
            y=industry_data[i],
            name=industry,
            boxpoints='outliers',
            marker_color=industry_colors[i % len(industry_colors)],
            line_color='white',
            fillcolor=industry_colors[i % len(industry_colors)],
            opacity=0.8,
            line=dict(width=2),
            boxmean=True,  # Show mean line
            whiskerwidth=0.8,
            marker=dict(size=5, opacity=0.7)
        ))
    
    fig.update_layout(
        title='Salary Distribution by Industry',
        yaxis_title='Salary at 30',
        showlegend=True,
        boxmode='group',
        boxgap=0.3
    )
    return update_plot_theme(fig)

# Callback for work experience vs salary scatter plot
@app.callback(
    Output('experience-salary-scatter', 'figure'),
    Input('experience-salary-scatter', 'relayoutData')
)
def update_experience_salary_scatter(relayoutData):
    fig = px.scatter(
        df,
        x='Work_Experience',
        y='Salary_at_30',
        trendline='ols',
        title='Salary vs Work Experience',
        color='GPA',
        color_continuous_scale=px.colors.sequential.Viridis,
        opacity=0.7,
        size='Certifications',
        size_max=15
    )
    fig.update_layout(
        xaxis_title='Years of Work Experience',
        yaxis_title='Salary at 30'
    )
    return update_plot_theme(fig)

# Callback for GPA vs salary scatter plot
@app.callback(
    Output('gpa-salary-scatter', 'figure'),
    Input('gpa-salary-scatter', 'relayoutData')
)
def update_gpa_salary_scatter(relayoutData):
    fig = px.scatter(
        df,
        x='GPA',
        y='Salary_at_30',
        trendline='ols',
        title='Salary vs GPA',
        color='Work_Experience',
        color_continuous_scale=px.colors.sequential.Viridis,
        opacity=0.7,
        size='Networking_Score',
        size_max=15
    )
    fig.update_layout(
        xaxis_title='GPA',
        yaxis_title='Salary at 30'
    )
    return update_plot_theme(fig)

# Callback for location salary box plot
@app.callback(
    Output('location-salary-box', 'figure'),
    Input('location-salary-box', 'relayoutData')
)
def update_location_salary_box(relayoutData):
    locations = ['Chicago', 'Los Angeles', 'New York', 'San Francisco']
    location_data = []
    
    for location in locations:
        location_data.append(df[df[f'Location_{location}'] == True]['Salary_at_30'])
    
    fig = go.Figure()
    for i, location in enumerate(locations):
        fig.add_trace(go.Box(
            y=location_data[i],
            name=location,
            boxpoints='outliers',
            marker_color=location_colors[i % len(location_colors)],
            line_color='white',
            fillcolor=location_colors[i % len(location_colors)],
            opacity=0.8,
            line=dict(width=2),
            boxmean=True,  # Show mean line
            whiskerwidth=0.8,
            marker=dict(size=5, opacity=0.7)
        ))
    
    fig.update_layout(
        title='Salary Distribution by Location',
        yaxis_title='Salary at 30',
        showlegend=True,
        boxmode='group',
        boxgap=0.3
    )
    return update_plot_theme(fig)

# Callback for certifications vs salary scatter plot
@app.callback(
    Output('certifications-salary-scatter', 'figure'),
    Input('certifications-salary-scatter', 'relayoutData')
)
def update_certifications_salary_scatter(relayoutData):
    fig = px.scatter(
        df,
        x='Certifications',
        y='Salary_at_30',
        trendline='ols',
        title='Salary vs Number of Certifications',
        color='Networking_Score',
        color_continuous_scale=px.colors.sequential.Viridis,
        opacity=0.7,
        size='Work_Experience',
        size_max=15
    )
    fig.update_layout(
        xaxis_title='Number of Certifications',
        yaxis_title='Salary at 30'
    )
    return update_plot_theme(fig)

# Callback for 3D scatter plot
@app.callback(
    Output('3d-scatter', 'figure'),
    Input('3d-scatter', 'relayoutData')
)
def update_3d_scatter(relayoutData):
    fig = px.scatter_3d(
        df,
        x='Work_Experience',
        y='GPA',
        z='Salary_at_30',
        color='Certifications',
        title='3D Relationship: Work Experience, GPA, and Salary',
        color_continuous_scale=px.colors.sequential.Viridis,
        opacity=0.7,
        size='Networking_Score',
        size_max=10
    )
    fig.update_layout(
        scene=dict(
            xaxis=dict(backgroundcolor=colors['plot_bg'],
                      gridcolor=colors['grid'],
                      showbackground=True,
                      zerolinecolor=colors['grid']),
            yaxis=dict(backgroundcolor=colors['plot_bg'],
                      gridcolor=colors['grid'],
                      showbackground=True,
                      zerolinecolor=colors['grid']),
            zaxis=dict(backgroundcolor=colors['plot_bg'],
                      gridcolor=colors['grid'],
                      showbackground=True,
                      zerolinecolor=colors['grid'])
        )
    )
    return update_plot_theme(fig)

# Callback for correlation heatmap
@app.callback(
    Output('correlation-heatmap', 'figure'),
    Input('correlation-heatmap', 'relayoutData')
)
def update_correlation_heatmap(relayoutData):
    # Select numeric columns for correlation
    numeric_cols = ['Work_Experience', 'GPA', 'Certifications', 'Internships', 
                   'Job_Changes', 'Networking_Score', 'Salary_at_30']
    corr_matrix = df[numeric_cols].corr()
    
    fig = go.Figure(data=go.Heatmap(
        z=corr_matrix,
        x=numeric_cols,
        y=numeric_cols,
        colorscale='Viridis',
        text=np.round(corr_matrix, 2),
        texttemplate='%{text}',
        textfont={"size": 12, "color": colors['text']},
        hoverongaps=False
    ))
    
    fig.update_layout(
        title='Correlation Heatmap of Numeric Variables',
        xaxis_title='Variables',
        yaxis_title='Variables',
        xaxis=dict(tickangle=45)
    )
    return update_plot_theme(fig)

if __name__ == '__main__':
    app.run_server(debug=True) 