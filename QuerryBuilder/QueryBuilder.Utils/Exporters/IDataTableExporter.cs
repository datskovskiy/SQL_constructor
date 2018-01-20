using System.Data;

namespace QueryBuilder.Utils.Exporters
{
    public interface IDataTableExporter
    {
        bool IncludeTitle { get; set; }

        void DataTableExport(DataTable dataTable, string filePath, string title);
    }
}