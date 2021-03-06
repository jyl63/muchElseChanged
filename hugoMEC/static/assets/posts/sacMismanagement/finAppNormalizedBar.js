const MARGINS = {top: 0, bottom: 0, right: 50, left: 50};
const BODY_WIDTH = d3.select('.contentBody').node().getBoundingClientRect().width;
const BAR_THICK = 60;

const CHART_WIDTH = 800 - MARGINS.left - MARGINS.right;
const CHART_HEIGHT = 275 - MARGINS.top - MARGINS.bottom;
const colors = ["0a5282","e0e0e2","81d2c7","b5bad0","e85f5c","7599b2","b1d9d5","9bc6cc","cf8d96","ea6e6b"];

// formats (large) numbers to have commas for ease of reading

commaFormat = d3.format(',')
const data = d3.csv('assets/posts/sacMismanagement/FinAppFY19-20Allocations.csv').then(
    dataFunc = data => {
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
                percent: percent(d.Funding),
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
            .attr('viewBox', '0 0 ' + (CHART_WIDTH + MARGINS.left + MARGINS.right) + ' 275');
        const chart = chartContainer.append('g');

        // creating bars
        chart.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .classed('bar', true)
                .attr('x', d => xScale(d.cumulative) + MARGINS.left)
                .attr('y', (CHART_HEIGHT / 2) - (BAR_THICK / 2) )
                .attr('width', d => xScale(d.Funding))
                .attr('height', BAR_THICK)
                .attr('data-Applicant', d => d.Applicant)
                .style('fill', (d,i) => colors[i])
            .on('mouseover', function(d){
                //tooltips
                name = d.Applicant;
                funding = commaFormat(d.Funding);
                d3.select('.tooltipdiv')
                    .html(name + ": $" + funding)
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
                        if (d3.select('.tooltipdiv').style('opacity') == 1){
                            //desktop mode, horizontally floating tooltip

                            return (rectXMid - tipShift) + 'px';        
                        } else {
                            SACRect = d3.selectAll('.bar')
                                .filter(function() {
                                    return d3.select(this).attr('data-Applicant') == 'SAC';
                                })
                            .node().getBoundingClientRect();
                            SACRectX = SACRect.x;
                            SACrRectWidth = SACRect.width;
                            tipShift = parseInt(d3.select(this).style('width')) / 2;
                            return (SACRectX) + 'px';
                        }
                    })
                    .style('top', function(){
                        rect = d3.selectAll('.bar')
                            .filter(function(){
                                return d3.select(this).attr('data-Applicant') == d.Applicant;
                            })
                            .node().getBoundingClientRect();
                        rectY = rect.y;
                        yOffSet = window.pageYOffset;
                        
                        if (d3.select('.tooltipdiv').style('opacity') == 1) {
                            // desktop mode, horizontally floating tooltip
                            return (yOffSet + rectY - 50) + 'px';
                        } else {
                            //mobile mode, fixed tooltip below graph and axis
                            return (yOffSet + rectY + 50) + 'px';
                        }
                    });
                
                //mobile stroke selector
                if (d3.select('.tooltipdiv').style('opacity') != 1){
                    //first remove default stroke on SAC bar
                    d3.selectAll('.bar')
                        .filter(function(){
                            return d3.select(this).attr('data-stroke') == 'SAC';
                        })
                        .attr('stroke', 'none');
                    
                    // add stroke to desired bar
                    d3.selectAll('.bar')
                        .filter(function(){
                            return d3.select(this).attr('data-Applicant') === d.Applicant;
                        })
                        .attr('stroke', 'black')
                        .attr('stroke-width' , '4px');
                }
            })
            .on('mouseout', function(d){
                if (d3.select('.tooltipdiv').style('opacity') != 1){
                    d3.selectAll('.bar')
                        .filter(function(){
                            return d3.select(this).attr('data-Applicant') === d.Applicant;
                        })
                        .attr('stroke', 'none');
                }
            });

        //creating actual axes based on theoretical scales
        const bottomAxis = d3.axisTop (xScale)
            .ticks(0);

        //attaching axis to chart
        chart.append('g')
            .attr('transform', `translate(${MARGINS.left}, ${CHART_HEIGHT - 80})`)
            .call(bottomAxis);

        //total FinApp expenditures label
        chart.append('text')
            .attr('transform', `translate(${(CHART_WIDTH / 2) + MARGINS.left }, ${CHART_HEIGHT - 55})`)
            .attr('x', (d3.select('body').clientWidth))
            .style('text-anchor', 'middle')
            .text('Total: $1,092,000');

        // chart title
        const title = d3.select('#finAppBarChart').append('div');
        function titlePlacementBar(){
            title
                .classed('chartTitle', true)
                .style('left', function(){
                    rect = d3.selectAll('.bar')
                        .filter(function(){
                            return d3.select(this).attr('data-Applicant') == 'SAC';
                        })
                        .node().getBoundingClientRect();
                    rectX = rect.x;
                    console.log(rectX);
                    return rectX + 'px';
                })
                .text('2019-20 GUSA FinApp Funding Allocation');
        }
        titlePlacementBar()
        
        // window.onresize = titlePlacementBar;
    
        // creating tooltip div
        const tooltipdiv = d3.select('#finAppBarChart')
        .append('div')
        .classed('tooltipdiv', true)
        //creating default positioning for tooltip
        .data(data)
        .html(function(){
            rect = d3.selectAll('.bar')
                .filter(function(){
                    return d3.select(this).attr('data-Applicant') == 'SAC';
                })
            name = rect.data()[0].Applicant;
            funding = commaFormat(rect.data()[0].Funding);
            return name + ": $" + funding;
        })
        .style('left', function(){
            rect = d3.selectAll('.bar')
                    .attr('data-Applicant', d => d.Applicant)
                    .filter(function() {
                        return d3.select(this).attr('data-Applicant') == 'SAC';
                    })
                    .node().getBoundingClientRect();
            rectX = rect.x;
            rectWidth = rect.width;
            rectXMid = rectX + (rectWidth / 2);
            tipShift = parseInt(d3.select(this).style('width')) / 2;

            //check if we are on mobile or desktop size
            if (d3.select('.tooltipdiv').style('opacity') == 1){
                // desktop mode, tooltip immediately below title
                return (rectXMid - tipShift) + 'px';
            } else {
                // mobile mode, tooltip below graph and axis label
                return rectX + 'px';
            }
        })
        .style('top', function(){
            rect = d3.selectAll('.bar')
                .filter(function(){
                    return d3.select(this).attr('data-Applicant') == 'SAC';
                })
                .node().getBoundingClientRect();
                rectY = rect.y;
                yOffSet = window.pageYOffset;
            if (d3.select('.tooltipdiv').style('opacity') === '1'){
                // desktop mode, tooltip immediately below title
                return (yOffSet + rectY - 50) + 'px';
            } else {
                //mobile mode, tooltip below graph and axis label
                return (yOffSet + rectY + 50) + 'px';
            }
        });

        //default stroke selection for mobile
        if (d3.select('.tooltipdiv').style('opacity') != 1){
            d3.selectAll('.bar')
                .filter(function(){
                    return d3.select(this).attr('data-Applicant') == 'SAC';
                })
                .attr('stroke', 'black')
                .attr('stroke-width', '4px');
        }

    //WINDOWRESIZE FUNCTIONS THAT NEED TO BE ACCESSED GLOBALLY
    dataFunc.titlePlacementBar = titlePlacementBar;
    }    
);
