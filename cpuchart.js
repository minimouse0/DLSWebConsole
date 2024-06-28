// 创建SVG容器
var svg = d3.select("#chart");

// 数据集合
/*
var data = [
    { x: "A", y: 10 },
    { x: "B", y: 20 },
    { x: "C", y: 23 },
    { x: "D", y: 25 },
    { x: "E", y: 8 },
    { x: "F", y: 12 }
];
// 定义x轴比例尺
var xScale = d3.scalePoint()
               .domain(data.map(function (d) { return d.x; }))
               .range([0, 400]);

// 定义y轴比例尺
var yScale = d3.scaleLinear()
               .domain([0, d3.max(data, function (d) { return d.y; })])
               .range([250, 0]);

// 添加路径元素并设置样式

var lineFunction = d3.line()
                     .x(function (d) { return xScale(d.x); })
                     .y(function (d) { return yScale(d.y); });

svg.append("path")
   .attr("class", "line")
   .datum(data)
   .attr("d", lineFunction);*/
const lineGenerator1=d3.line();
const points1=[
    [0,50],[100,window.innerHeight],[window.innerWidth,100]
];
const linePath1=lineGenerator1(points1);
svg.append("path")
    .attr("d",linePath1)
    .attr("fill","none")
    .attr("stroke-width",5)
    .attr("stroke","lightblue");
setTimeout(()=>{
d3.select("#chart").selectAll("*").remove();
const lineGenerator2=d3.line();
console.log(innerWidth)
const points2=[
    [0,50],[100,50],[window.innerWidth,100]
];
const linePath2=lineGenerator2(points2);
svg.append("path")
    .attr("d",linePath2)
    .attr("fill","none")
    .attr("stroke-width",5)
    .attr("stroke","lightblue");            
},2000)