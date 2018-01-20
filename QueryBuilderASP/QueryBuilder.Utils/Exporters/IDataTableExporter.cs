using System.Data;
using System.IO;

namespace QueryBuilder.Utils.Exporters
{
    public interface IDataTableExporter
    {
        bool IncludeTitle { get; set; }

        void DataTableExportToFile(DataTable dataTable, string filePath, string title);

        MemoryStream DataTableExportToMemory(DataTable dataTable, string title);
    }
}