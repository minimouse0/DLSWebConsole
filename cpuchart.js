"use strict";
//getHardwareStatus()
/**这个数据会越来越大，将来必须优化 */
const cpuStatusHistory=[]
let mainChart=null;
function updateCPUStatus(status){
    //更新CPU数据
    cpuStatusHistory.push({
        time:new Date(),
        status
    });
    //更新图表
    //if(cpuStatusHistory.length<2)return;
    //创建前段的空数据
    const dataVoid=(()=>{
        let dataVoidTemp=[];
        for(let i=1;i<=30;i++){
            dataVoidTemp.push({
                time:new Date(i),
                status:0
            })
        }
        return dataVoidTemp;
    })();
    //将前段的空数据拼接进原始数据
    //创建当前CPU记录的副本以便此次处理制作表格
    const duplicatedCpuSatusHistory=dataVoid.concat(cpuStatusHistory);
    //截取最后n段作为输入进表格的数据
    duplicatedCpuSatusHistory.splice(0,duplicatedCpuSatusHistory.length-30);
    const labels=[];const cpuStatus=[];
    //解析数据，分成x轴的数据（lablels）和y轴的数据（cpuStatus）
    for(let CPUStatus of duplicatedCpuSatusHistory){
        //labels.push(CPUStatus.time.getTime());
        labels.push('-');
        cpuStatus.push(CPUStatus.status);
    }
    const mainChartElement=document.getElementById("mainChart");
    const data={
        labels,
        datasets:[{
            data:cpuStatus,
            fill:true,
            tension:0.5
        }]
    }
    const options={
        maintainAspectRatio: false,
        scales: {
          y: {
            display:false,
            max:100,
            /*stacked: true,
            grid: {
              display: false,
              color: "rgba(255,99,132,0.2)"
            },*/
          },
          x: {
            display:false,
            /*grid: {
              display: false
            }*/
          }
        },
        animation:false,
        elements:{
            point:{
                pointRadius:0
            }
        },
        datasets:{
            line:{
                fill:true
            }
        },
        plugins:{
            legend:{
                display:false
            }
        }
    };
    const config={
        type:"line",
        options,
        data
    }
    //清除原图表
    if(mainChart)mainChart.destroy();
    try{
        Chart
    }
    catch(e){
        nortify("error","暂时无法从第三方cdn获取Chart.js，请刷新网页以重试。")
    }
    //生成新图表
    mainChart=new Chart(mainChartElement,config);
    //mainChart.canvas.parentNode.style.height=window.innerHeight
}




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
   .attr("d", lineFunction);

//校准svg
let svgElement=document.getElementById("chart");


// 创建SVG容器
var svg = d3.select("#chart");
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
//d3.select("#chart").selectAll("*").remove();*/