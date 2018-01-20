using System.Collections.Generic;

namespace GraphSharpDemo
{
    /// <summary>
    /// A simple identifiable vertex.
    /// </summary>
//[DebuggerDisplay("{ID}-{IsMale}")]
    public class Vertex
    {
        public string ID { get; private set; }

        public List<string> List { get; private set; }

        public Vertex(string id, List<string> list)
        {
            ID = id;
            List = list;
        }


        public Vertex()
        {
        }

        public Vertex AddToInstanse(string id, List<string> list)
        {
            return new Vertex(id, list);
        }

        public override string ToString()
        {
            return string.Format(ID);
        }
    }
}
