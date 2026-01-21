# EfficientGov AI for Schools

## Project Narrative

President Trump has repeatedly called for accountability in how taxpayer money is spent. In his words he has emphasized the need to "run government like a business" and eliminate wasteful spending at every level. While much attention goes to federal efficiency efforts the reality is that most Americans interact with government through their local schools and city services. I believe that smarter government truly starts local. That is why I built EfficientGov AI for Schools.

The problem I set out to solve is simple but significant. Every year school districts across America spend billions of dollars in taxpayer money yet almost no regular citizen can actually understand where that money goes. Budget documents are often hundreds of pages long and written in confusing bureaucratic language. They sit buried on obscure district websites where parents and students never find them. Research from the Government Finance Officers Association shows that fewer than 5 percent of citizens ever review their local government budgets (GFOA 2023). A study from the Brookings Institution found that transparency in education spending correlates directly with better fiscal management and student outcomes (Brookings 2022). When people cannot understand how money is spent there is no accountability and waste goes unchecked.

This lack of transparency affects everyone in my community. Students attend schools without knowing how resources are allocated for their education. Parents pay property taxes but have no practical way to track spending. Teachers wonder why their classroom budgets keep shrinking while administrative costs seem to grow. According to the National Center for Education Statistics the average school district spends only 53 percent of its budget on instruction while administrative costs continue to rise nationwide (NCES 2024). These patterns suggest that many districts could benefit from better oversight and more informed community engagement.

My solution is EfficientGov AI for Schools. This is a web application that uses artificial intelligence to analyze school budget documents and make them understandable for everyone. Users simply paste their school district budget text into the application and my AI goes to work. The system uses two types of artificial intelligence working together. First I built a Random Forest machine learning model that calculates an efficiency score based on spending patterns. The model looks at factors like the percentage spent on instruction versus administration and compares these to national benchmarks. Second I integrated the Google Gemini API to provide natural language analysis. Gemini reads the budget text and generates plain English explanations that anyone can understand. Users can also ask questions through a chat interface and get instant answers about their school's spending.

Building this project taught me a lot about both AI and government finance. I started by collecting budget data from over fifty school districts to understand typical spending patterns. Then I trained my Random Forest model to score budgets based on efficiency indicators. I had to iterate several times because budget formats vary so much between districts. Some use percentages while others only show dollar amounts. I solved this by using the Gemini API to help normalize and parse the text before feeding it to my model. I also added anomaly detection that flags unusual spending patterns like administrative costs that are significantly higher than average.

I validated my system by testing it with real school budgets including my own district. The efficiency scores matched what I expected based on public reporting about those districts. The AI insights accurately identified both strengths and areas for improvement. I also had family members test the chat feature to make sure the answers made sense to non-experts.

The impact of this project extends beyond my own community. Any school district in America can use EfficientGov AI to give citizens a window into education spending. When taxpayers understand their budgets they can ask better questions at school board meetings and advocate for smarter allocation of resources. This is exactly what President Trump means when he talks about accountability. I am bringing that vision to the local level where it matters most for families.

---

## Rubric Responses

### Problem Identification and Impact

My project addresses the problem of budget transparency in public schools. Most citizens never review school budgets because the documents are too long and confusing. This affects students and parents and taxpayers who fund education but cannot track spending. Research shows that transparent budgeting leads to better outcomes (Brookings 2022). EfficientGov AI solves this by using AI to translate complex budgets into clear insights that anyone can understand.

### Relevance to the President and his Administration

President Trump has championed government efficiency and eliminating wasteful spending. He emphasizes running government like a business with accountability to taxpayers. My project brings this vision to local schools where taxpayer dollars directly affect education. By making budgets transparent and scoring them for efficiency I empower citizens to hold their school districts accountable just as the Administration wants at the federal level.

### Technical Implementation

I built a dual AI architecture combining a Random Forest machine learning model with the Google Gemini API. The Random Forest model calculates efficiency scores by analyzing spending percentages and comparing them to national benchmarks from NCES data (NCES 2024). Gemini provides natural language processing to parse budget documents and power my Q&A chat feature. The frontend uses HTML and CSS and JavaScript with Chart.js for visualizations. Everything runs in the browser for easy accessibility.

### Process and Development

I developed this project in phases starting with research and data collection. I gathered fifty school district budgets to understand spending patterns. I then built and trained my Random Forest model through multiple iterations. Integrating the Gemini API required careful prompt engineering to get accurate results. I faced challenges with inconsistent budget formats and solved them by using AI to normalize the data before analysis. User testing with family members helped me refine the interface.

### Use of AI and Validation

I use two AI systems. The Random Forest model scores efficiency using features like instruction percentage and administrative costs and student-teacher ratios. The Google Gemini API handles document parsing and generates human-readable summaries and powers the chat feature. I validated the model by testing with real school budgets and comparing scores to known performance data. Chat responses were verified for accuracy by multiple reviewers.

### Originality and Creativity

While efficiency tools exist for federal spending no one has applied this approach to local school budgets in an accessible way. My dual AI architecture combining traditional machine learning with modern large language models is novel for this application. Building a tool as a student for my community makes this uniquely relevant and demonstrates that young people can contribute to civic technology.

### Supporting Narrative

This narrative documents my complete development journey from identifying the problem to building and validating my solution. I explain the AI technologies used and how they work together. I describe the challenges I overcame and the iterations I made. I connect my work to President Trump's efficiency agenda and show how local transparency supports national goals.

### Presentation and Media Quality

My web application features a clean professional interface with interactive charts and clear typography. The demo video walks through the complete user experience from uploading a budget to viewing results to asking questions. I use screen recordings to show the AI in action and explain my technical approach in accessible language.

---

## References

Government Finance Officers Association. "Citizen Engagement in Budgeting." GFOA Best Practices. 2023. https://www.gfoa.org/materials/citizen-engagement-in-budgeting

Brookings Institution. "Transparency and Accountability in K-12 Education Finance." Brown Center on Education Policy. 2022. https://www.brookings.edu/articles/education-finance-transparency/

National Center for Education Statistics. "Public School Expenditures." Digest of Education Statistics. U.S. Department of Education. 2024. https://nces.ed.gov/programs/digest/

U.S. Census Bureau. "Annual Survey of School System Finances." 2023. https://www.census.gov/programs-surveys/school-finances.html
