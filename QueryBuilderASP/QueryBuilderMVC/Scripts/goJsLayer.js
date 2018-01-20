

function init(data) {

	goGraph = go.GraphObject.make;

	settings = {
		color: "graygrad"
	}
 
	// define several shared Brushes
	bluegrad = goGraph(go.Brush, "Linear", { 0: "rgb(150, 150, 250)", 0.5: "rgb(86, 86, 186)", 1: "rgb(86, 86, 186)" });
	greengrad = goGraph(go.Brush, "Linear", { 0: "rgb(158, 209, 159)", 1: "rgb(67, 101, 56)" });
	redgrad = goGraph(go.Brush, "Linear", { 0: "rgb(206, 106, 100)", 1: "rgb(180, 56, 50)" });
	yellowgrad = goGraph(go.Brush, "Linear", { 0: "rgb(254, 221, 50)", 1: "rgb(254, 182, 50)" });
	lightgrad = goGraph(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });
	graygrad = goGraph(go.Brush, "Linear", { 1: "#CCCCCC", 0: "#ffffff" });

	myDiagram = goGraph(go.Diagram, "erModel", {
		initialContentAlignment: go.Spot.Center,
		allowDelete: false,
		allowCopy: false,
		allowResize: false,
		layout: goGraph(go.ForceDirectedLayout),
		"undoManager.isEnabled": true
	});
	console.log(myDiagram);

	//// the template for each attribute in a node's array of item data
	var itemTempl =
	  goGraph(go.Panel, "Horizontal",
		//goGraph(go.Shape,
		//  { desiredSize: new go.Size(100, 100) },
		//  new go.Binding("figure", "figure"),
		//  new go.Binding("fill", "color")),
		goGraph(go.TextBlock,
		  {
		  	stroke: "#333333",
		  	font: "bold 14px sans-serif"
		  },
		  new go.Binding("text", "name"))
	  );


	
	//// define the Node template, representing an entity
	myDiagram.nodeTemplate =
	  goGraph(go.Node, "Auto",  // the whole node panel
		{
			selectionAdorned: true,
			resizable: true,
			layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
			fromSpot: go.Spot.AllSides,
			toSpot: go.Spot.AllSides,
			isShadowed: true,
			shadowColor: "#C5C1AA"
		},
		new go.Binding("location", "location").makeTwoWay(),
		// define the node's outer shape, which will surround the Table
		goGraph(go.Shape, "Rectangle",
		  { fill: this[settings.color], stroke: "#756875", strokeWidth: 3 }),
		goGraph(go.Panel, "Table",
		  { margin: 8, stretch: go.GraphObject.Fill },
		  goGraph(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
		  // the table header
		  goGraph(go.TextBlock,
			{
				row: 0, alignment: go.Spot.Center,
				margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
				font: "bold 16px sans-serif"
			},
			new go.Binding("text", "key")),
		  // the collapse/expand button
		  goGraph("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
			{ row: 0, alignment: go.Spot.TopRight }),
		  // the list of Panels, each showing an attribute
		  goGraph(go.Panel, "Vertical",
			{
				name: "LIST",
				row: 1,
				padding: 3,
				alignment: go.Spot.TopLeft,
				defaultAlignment: go.Spot.Left,
				stretch: go.GraphObject.Horizontal,
				itemTemplate: itemTempl,
			},
			new go.Binding("itemArray", "items"))
		)  // end Table Panel
	  );  // end Node
	// define the Link template, representing a relationship
	myDiagram.linkTemplate =
	   goGraph(go.Link,
		 { routing: go.Link.AvoidsNodes },  // link route should avoid nodes
		 goGraph(go.Shape),
		 goGraph(go.Shape, { toArrow: "Standard" })
	   );
	// create the model for the E-R diagram
	var nodeDataArray = data[0];
	var linkDataArray = data[1];

	myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}

function changeLayout(layout) {

	console.log(settings);
	myDiagram.startTransaction("change layout");
	//myDiagram.linkTemplate = myDiagram.linkTemplateMap.getValue("normal");
	myDiagram.layout = go.GraphObject.make(go[layout]);
	myDiagram.commitTransaction("change layout");
}

function changeColor() {
	myDiagram.startTransaction("change color");

	myDiagram.nodeTemplate =
	  goGraph(go.Node, "Auto",  // the whole node panel
		{
			selectionAdorned: true,
			resizable: true,
			layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
			fromSpot: go.Spot.AllSides,
			toSpot: go.Spot.AllSides,
			isShadowed: true,
			shadowColor: "#C5C1AA"
		},
		new go.Binding("location", "location").makeTwoWay(),
		// define the node's outer shape, which will surround the Table
		goGraph(go.Shape, "Rectangle",
		  { fill: yellowgrad, stroke: "#756875", strokeWidth: 3 }),
		goGraph(go.Panel, "Table",
		  { margin: 8, stretch: go.GraphObject.Fill },
		  goGraph(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None}),
		  goGraph(go.RowColumnDefinition,{row: 1, sizing: go.RowColumnDefinition.None}),
		  // the table header
		  goGraph(go.TextBlock,
			{
				row: 0, alignment: go.Spot.Center,
				margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
				font: "bold 16px sans-serif"
			},
			new go.Binding("text", "key")),
		  // the collapse/expand button
		  goGraph("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
			{ row: 0, alignment: go.Spot.TopRight }),
		  // the list of Panels, each showing an attribute
		  goGraph(go.Panel, "Vertical",
			{
				name: "LIST",
				row: 1,
				padding: 3,
				alignment: go.Spot.TopLeft,
				defaultAlignment: go.Spot.Left,
				stretch: go.GraphObject.Horizontal,
				itemTemplate: itemTempl
			},
			new go.Binding("itemArray", "items"))
		)  // end Table Panel
	  );  // end Node




	myDiagram.commitTransaction("change coor");
}
