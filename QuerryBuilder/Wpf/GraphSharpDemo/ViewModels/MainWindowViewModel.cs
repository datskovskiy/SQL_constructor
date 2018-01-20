using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel;
using System.Data.Entity.Core.Metadata.Edm;
using System.Data.SqlClient;
using BuilderBL;
using GraphSharp.Controls;

namespace GraphSharpDemo
{
    public class PocGraphLayout : GraphLayout<Vertex, Edge, Graph> { }

    public class MainWindowViewModel : INotifyPropertyChanged
    {
        #region Data
        public string List { get; set; }
        private string layoutAlgorithmType;
        private Graph graph;
        private List<string> layoutAlgorithmTypes = new List<string>();
        #endregion

        #region Ctor
        public MainWindowViewModel()
        {

            Graph = new Graph(true);

            //Добавление сущностей

            #region Database

            string str = Wpf.DataModel.MainWindowData.StringConnect;
            var _shema = new DbSchema(str);
            var existingVertices = (from item in _shema.GetTableEntities(_shema) let tempVertex = new Vertex() let tempList = item.Value.ToList() select tempVertex.AddToInstanse(item.Key, tempList)).ToList();
            Graph.AddVertexRange(existingVertices);
            var connection = new SqlConnection(str);
            const string querry = "Select kcup.Table_name, kcuc.TABLE_NAME " +
                                  "From INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc " +
                                  "Left Join INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcup On " +
                                  "rc.UNIQUE_CONSTRAINT_NAME = kcup.CONSTRAINT_NAME " +
                                  "LEFT Join INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcuc on " +
                                  "rc.CONSTRAINT_NAME = kcuc.CONSTRAINT_NAME and kcup.ORDINAL_POSITION = kcuc.ORDINAL_POSITION";
            var command = new SqlCommand(querry, connection);
            connection.Open();
            var reader = command.ExecuteReader();

            while (reader.Read())
            {
                foreach (var t in existingVertices)
                {
                    if (reader[0].ToString() == reader[1].ToString()) continue;
                    if (t.ToString() != reader[0].ToString()) continue;
                    var index = 0;
                    foreach (var id in existingVertices)
                    {
                        if (id.ID == reader[1].ToString())
                        {
                            // связи между сущностями
                            AddNewGraphEdge(t, existingVertices[index]);
                        }
                        index++;
                    }
                }
            }
            connection.Close();
            #endregion

            //Algorithms

            layoutAlgorithmTypes.Add("BoundedFR");
            layoutAlgorithmTypes.Add("Circular");
            layoutAlgorithmTypes.Add("CompoundFDP");
            layoutAlgorithmTypes.Add("EfficientSugiyama");
            layoutAlgorithmTypes.Add("FR");
            layoutAlgorithmTypes.Add("ISOM");
            layoutAlgorithmTypes.Add("KK");
            layoutAlgorithmTypes.Add("LinLog");
            layoutAlgorithmTypes.Add("Tree");

            //Pick a default Layout Algorithm Type
            LayoutAlgorithmType = "LinLog";
        }
        #endregion


        #region Private Methods
        private Edge AddNewGraphEdge(Vertex from, Vertex to)
        {
            string edgeString = $"{@from.ID}-{to.ID} Connected";

            Edge newEdge = new Edge(edgeString, from, to);
            Graph.AddEdge(newEdge);
            return newEdge;
        }


        #endregion

        #region Public Properties

        public List<string> LayoutAlgorithmTypes => layoutAlgorithmTypes;


        public string LayoutAlgorithmType
        {
            get { return layoutAlgorithmType; }
            set
            {
                layoutAlgorithmType = value;
                NotifyPropertyChanged("LayoutAlgorithmType");
            }
        }



        public Graph Graph
        {
            get { return graph; }
            set
            {
                graph = value;
                NotifyPropertyChanged("Graph");
            }
        }


        #endregion

        #region INotifyPropertyChanged Implementation

        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged(string info)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(info));
        }

        #endregion
    }
}
