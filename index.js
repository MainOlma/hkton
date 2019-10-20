import * as d3 from "d3";
import map from './gridmap.csv'
import data from './data.csv'

const w = 960, h = 550,
    mini_w = 100, mini_h=50

//scales
const rowscale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, h])

const colscale = d3.scaleLinear()
    .domain([0, 18])
    .range([0, w])

const mini_rowscale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, mini_h])

const mini_colscale = d3.scaleLinear()
    .domain([0, 18])
    .range([0, mini_w])

const color = d3.scaleSequential(d3.interpolateGreens)
    .domain([0, 2000]);

function getColor(value, max){
    const color = d3.scaleSequential(d3.interpolateGreens)
        .domain([0, max]);
    value = (Number.isNaN(value)) ?  0 : value
    return color(value)
}

function getColorField(value, max,min){
    /*const color = d3.scaleSequential(d3.interpolateGreens)
        .domain([0, max]);*/

    let color = d3.scaleLinear()
        .domain([min, 0, max])
        .range(["red", "white", "green"])
        .clamp(true)
        //.interpolate(d3.interpolateHcl);

    value = (Number.isNaN(value)) ?  0 : value

    return color(value)
}

function drawMap(countryData) {

    //Set up SVG
    const svg = d3.select("#root").append("svg").classed("mainChart",true)
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "black");

// label boxes
    const labelboxes = svg.selectAll("rect.boxes").data(countryData).enter().append("rect")
        .attr("fill", "rgba(0,0,0,0)")
        .attr("class", "boxes")
        .attr("width", colscale(1))
        .attr("height", rowscale(1))
        .attr("x", d => {
            return colscale(+d.col);
        })
        .attr("y", d => {
            return rowscale(+d.row);
        });

    // Labels
    const labels = svg.selectAll("text.label")
        .data(countryData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("font-size", 16)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("x", d => {
            if (d) return colscale(+d.col - 0.5+1)
        })
        .attr("y", d => {
            if (d) return rowscale(+d.row - 0.35+1);
        })
        .text(d => d.subject_short)

    const values = svg.selectAll("text.value")
        .data(countryData)
        .enter()
        .append("text")
        .attr("class", "value")
        .attr("font-size", 16)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("x", d => {
            if (d) return colscale(+d.col - 0.5+1)
        })
        .attr("y", d => {
            if (d) return rowscale(+d.row - 0.6+1);
        })
        .text("0")


    /*labelboxes.on("mouseover", function (d) {
        focus = d.CountryCode
        // get THIS box's x and y values
        var xPos = parseFloat(d3.select(this).attr("x")) + 20;
        var yPos = parseFloat(d3.select(this).attr("y")) + 20;
        //console.log(yPos)
        // update tooltip
        d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
        d3.select("#tooltip .name").text(d.ShortName)
        d3.select("#tooltip #value").text(d3.format(",.2f")(Math.abs(+d['2016sexes']))+"%")
        d3.select("#tooltip .year").text(" в 2000");

        d3.select("#tooltip").classed("hidden", false);
    });
    labelboxes.on("mouseout", function () {
        d3.select(this).style("fill", "rgba(0,0,0,0)");
        d3.select("#tooltip").classed("hidden", true);
    });*/

}

function updateMap(subjects_data, map_data){

    const selectedType = d3.select('.menu.active').attr("data-type")
    const selectedField = d3.select('.menuTarget.active').attr("data-target")

    const targetField = selectedField
    const t = d3.transition()
        .duration(750);
    const t2 = d3.transition()
        .duration(750/2);

    const service_type=selectedType

    const max = d3.max(subjects_data.filter(d=>d.service_type==service_type).map(d=>+d[targetField]))
    const min = d3.min(subjects_data.filter(d=>d.service_type==service_type).map(d=>+d[targetField]))
    console.log(subjects_data.filter(d=>d.service_type==service_type).map(d=>{return {val:+d[targetField], sub:d.subject_rf}}), max, service_type)

    const mainSvg = d3.select("#root svg.mainChart")

    const rects = mainSvg.selectAll("rect")
        .data(map_data.map(d => {
                let tmp = subjects_data.find(e => e.subject_rf == d.subject && e.service_type==service_type)
                if (!tmp) tmp={}
            return {
                    subject:tmp.subject_rf,
                    value: +tmp[targetField],
                    iso:d.shortname,
                    feature: d
                }
            }))

    rects.exit()
        .attr("class", "exit sub")
        .transition(t)
        .remove();

    rects.attr("class", "update sub")
        .transition(t)
        .style("fill", (d) => {
            if (selectedField=="value_cost") return getColor(+d.value, max)
            else return getColorField(+d.value, max,min)
        })


    const texts = mainSvg.selectAll("text.value")
        .data(map_data.map(d => {
            let tmp = subjects_data.find(e => e.subject_rf == d.subject && e.service_type==service_type)

            if (!tmp) tmp={}

            return {
                subject:tmp.subject_rf,
                value: +tmp[targetField],
                iso:d.shortname,
                feature: d
            }
        }))

   /* texts.exit()
        .attr("class", "exit sub")
        .transition(t)
        .remove();*/
    const f = d3.format(".1f");
    texts.style("opacity",0).transition(t2).style("opacity",1)
        .text(d => {
            //console.log(d)
            let context
            if (!Number.isNaN(d.value)) context = f(d.value)
            else context = ""

            return context
        })

}

function createTypeMenu(subjects_data,map_data){
    var uniqueArray = [...new Set(subjects_data.map(d=>d.service_type))]
    const menu_div = document.getElementById('menu')
    uniqueArray.forEach((d,i)=>{
        let option = document.createElement('div');
        option.className='menu menu'+i
        option.innerText=d
        if  (i==0) option.className='menu active menu'+i
        option.setAttribute('data-type',d)
        option.setAttribute('data-type-id',i)
        let minimap = document.createElement('div')
        minimap.className = 'minimap'+i
        option.appendChild(minimap)

        option.onclick=()=> {
            d3.selectAll('.menu').classed("active",false)
            d3.selectAll('.menu'+i).classed("active",true)
            updateMap(subjects_data,map_data, d)}
        menu_div.appendChild(option)
        createMiniMap(subjects_data,map_data,d, i,'value_cost')
        createMiniMap(subjects_data,map_data,d, i,'value_competition')
    })
    return uniqueArray[0]
}

function createTargetMenu(subjects_data,map_data){
    var uniqueArray = ["value_cost","value_competition"]

    const menu_div = document.getElementById('menuTarget')
    uniqueArray.forEach((d,i)=>{
        let option = document.createElement('div');
        option.className='menuTarget menuTarget'+i
        option.innerText=d
        if  (i==0) option.className='menuTarget active menuTarget'+i
        option.setAttribute('data-target',d)
        option.setAttribute('data-target-id',i)
        option.onclick=()=> {
            d3.selectAll('.menuTarget').classed("active",false)
            d3.selectAll('.menuTarget'+i).classed("active",true)
            d3.selectAll('svg.minimap').classed('hidden',true)
            d3.selectAll('svg.minimap.'+d).classed('hidden',false)

            updateMap(subjects_data,map_data)

        }
        menu_div.appendChild(option)

    })
    return uniqueArray[0]
}

function createMiniMap(subjects_data,map_data,service_type,i,selectedTargetField){
    const targetField = selectedTargetField
    const max = d3.max(subjects_data.filter(d=>d.service_type==service_type).map(d=>+d[targetField]))
    const min = d3.min(subjects_data.filter(d=>d.service_type==service_type).map(d=>+d[targetField]))

    const svg = d3.select(".minimap"+i).append("svg").classed("minimap "+targetField,true)
        .attr("width", mini_w)
        .attr("height", mini_h)
        .attr("id",i)

    if(targetField=="value_competition") svg.classed('hidden',true)

    const labelboxes = svg.selectAll("rect.boxes")
        .data(map_data.map(d => {
            let tmp = subjects_data.find(e => e.subject_rf == d.subject && e.service_type==service_type)

            if (!tmp) tmp={}

            return {
                subject:tmp.subject_rf,
                value: +tmp[targetField],
                iso:d.shortname,
                feature: d
            }
        }))
        .enter().append("rect")
        .style("fill", ((d) => {
            if (targetField=="value_cost") return getColor(+d.value, max)
            else return getColorField(+d.value, max,min)
        }))
        .attr("class", "boxes")
        .attr("width", mini_colscale(1))
        .attr("height", mini_rowscale(1))
        .attr("x", d => {
            return mini_colscale(+d.feature.col);
        })
        .attr("y", d => {
            return mini_rowscale(+d.feature.row);
        });

}

function updateMiniMaps(){
    let svgs=d3.selectAll(".menu svg")
    svgs.nodes().forEach((svg)=>{
        console.log(svg.id, d3.select(svg).attr("id"))

    })
}




d3.csv(map).then(map_data=>{
    drawMap(map_data)

    d3.csv(data).then(subjects_data=>{
        const defaultType = createTypeMenu(subjects_data,map_data)
        const defaultTarget = createTargetMenu(subjects_data,map_data)
        let working_data
        working_data = subjects_data.map(d=>{
            return{
                subject:d.subject_rf,
                value:d.value
            }
        })
        updateMap(subjects_data,map_data)
    })


})