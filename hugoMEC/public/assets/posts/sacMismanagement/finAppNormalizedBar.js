const MARGINS = {top: 10, bottom: 10, right: 50, left: 50};
const BODY_WIDTH = d3.select('.contentBody').node().getBoundingClientRect().width;

// const CHART_WIDTH = parseInt(BODY_WIDTH);
const CHART_WIDTH = 800 - MARGINS.left - MARGINS.right;
const CHART_HEIGHT = 200 - MARGINS.top - MARGINS.bottom;
const colors = ["0a5282","e0e0e2","81d2c7","b5bad0","e85f5c","7599b2","b1d9d5","9bc6cc","cf8d96","ea6e6b"];


const data = d3.csv('assets/posts/sacMismanagement/FinAppFY19-20Allocations.csv').then(
    data => {

        // turning strings into num
        data.forEach(function(d) {
            d.Funding = +d.Funding;
        });
    
        // sorting
        data = data.slice()
            .sort((a,b) => d3.descending(a.Funding, b.Funding))
    
        total = d3.sum(data, d => d.Funding);

        // new percent variable created
        percent = d3.scaleLinear()
            .domain([0, total])
            .range([0, 100])

        // returning new and improved data (with cumulative location and percent values)
        let cumulative = 0;
        data = data.map(d => {
            cumulative += d.Funding;
            return {
                Applicant: d.Applicant,
                Funding: d.Funding,
                cumulative: cumulative  - d.Funding,
                percent: percent(d.Funding)
            }
        });
    
        // constructing theoretical axes
        const xScale = d3.scaleLinear()
            .range([0, CHART_WIDTH])
            .domain([0, total]);

        // creating chart container and the base chart svg
        const chartContainer = d3.select('#finAppBarChart')
            .append('svg')
            .classed('container', true)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('viewBox', '0 0 ' + (CHART_WIDTH + MARGINS.left + MARGINS.right) + ' 200');
        const chart = chartContainer.append('g');

        // creating tooltip div
        const tooltipdiv = d3.select('#finAppBarChart')
            .append('div')
            .classed('tooltipdiv', true);

        tooltipdiv.text('here is some text');

        // creating bars
        chart.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .classed('bar', true)
                .attr('x', d => xScale(d.cumulative) + MARGINS.left)
                .attr('y', (CHART_HEIGHT / 2) - (30) )
                .attr('width', d => xScale(d.Funding))
                .attr('height', 60)
                .attr('data-Applicant', d => d.Applicant)
                .style('fill', (d,i) => colors[i])
            .on('mouseover', function(d){
                name = d.Applicant;
                //one-sided margin
                let BODY_MARGINS = (d3.select('body').node().getBoundingClientRect().width - d3.select('.content').node().getBoundingClientRect().width) / 2;
                d3.select('.tooltipdiv')
                    .html(name)
                    //appear
                    .style('opacity', 1)
                    //take all margins and viewport into account
                    .style('left', function(){
                        rect = d3.selectAll('.bar')
                            .filter(function(){
                                return d3.select(this).attr('data-Applicant') == d.Applicant;
                            })
                            .node().getBoundingClientRect();
                        rectX = rect.x;
                        rectWidth = rect.width;
                        rectXMid = rectX + (rectWidth / 2);
                        tipShift = parseInt(d3.select(this).style('width')) / 2;
                        return (rectXMid - tipShift) + 'px';
                    })
                    .style('top', function(){
                        rect = d3.selectAll('.bar')
                            .filter(function(){
                                return d3.select(this).attr('data-Applicant') == d.Applicant;
                            })
                            .node().getBoundingClientRect();
                        rectY = rect.y;
                        yOffSet = window.pageYOffset;
                        return (yOffSet + rectY - 50) + 'px';
                    });
            })
            .on('mouseout', function(d){
                //disappear 
                d3.select('.tooltipdiv')
                    .style('opacity', 0);
            });
    }
);
        