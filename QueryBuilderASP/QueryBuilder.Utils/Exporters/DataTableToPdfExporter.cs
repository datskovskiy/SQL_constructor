using System;
using System.Data;
using System.IO;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace QueryBuilder.Utils.Exporters
{
    public class DataTableToPdfExporter : IDataTableExporter
    {
        private static DataTableToPdfExporter _instance;

        public bool IncludeTitle { get; set; }

        protected DataTableToPdfExporter()
        {
            IncludeTitle = true;
        }

        public static DataTableToPdfExporter CreateInstance()
        {
            return _instance ?? (_instance = new DataTableToPdfExporter());
        }

        public void DataTableExportToFile(DataTable dataTable, string filePath, string title)
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                throw new FileNotFoundException("Incorrect file path.");
            }

            if ((dataTable == null) || (dataTable.Rows.Count == 0))
                throw new ArgumentException("Empty data table.");

            var document = new Document(PageSize.A4.Rotate(), 10, 10, 10, 10);

            var writer = PdfWriter.GetInstance(document, new FileStream(filePath, FileMode.Create));

            AddContentToDocument(document, dataTable, title);

            writer.Close();
        }

        public MemoryStream DataTableExportToMemory(DataTable dataTable, string title)
        {
            if ((dataTable == null) || (dataTable.Rows.Count == 0))
                throw new ArgumentException("Empty data table.");

            var document = new Document(PageSize.A4.Rotate(), 10, 10, 10, 10);

            var pdfStream = new MemoryStream();
            var writer = PdfWriter.GetInstance(document, pdfStream);

            AddContentToDocument(document, dataTable, title);

            writer.Close();

            return pdfStream;
        }


        private void AddContentToDocument(Document document, DataTable dataTable, string title)
        {
            if (document == null) throw new ArgumentNullException(nameof(document));

            document.Open();

            // Add title
            var cell = new PdfPCell();
            if (IncludeTitle)
            {
                var pdfTitle = new PdfPTable(1);

                GetPdfCell(ref cell, title, GetFont(12, Font.BOLD), 0);
                pdfTitle.AddCell(cell);
                document.Add(pdfTitle);
            }

            var table = new PdfPTable(dataTable.Columns.Count);
            // Add header

            for (var i = 0; i < dataTable.Columns.Count; i++)
            {
                GetPdfCell(ref cell, dataTable.Columns[i].ColumnName, GetFont(10, Font.BOLD), 2);
                table.AddCell(cell);
            }

            // Add content
            using (var dtReader = dataTable.CreateDataReader())
            {
                while (dtReader.Read())
                {
                    for (var i = 0; i < dtReader.FieldCount; i++)
                    {
                        GetPdfCell(ref cell, dtReader.GetValue(i).ToString().Trim(), GetFont(10, Font.NORMAL), 1);
                        table.AddCell(cell);
                    }
                }
            }

            document.Add(table);

            document.Close();
        }

        private static Font GetFont(int sizeFont, int styleFont)
        {
            var fg = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "Arial.TTF");
            var fgBaseFont = BaseFont.CreateFont(fg, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
            return new Font(fgBaseFont, sizeFont, styleFont);
        }

        private static void GetPdfCell(ref PdfPCell cell, string content, Font fontContent, float borderWidth)
        {
            cell.Phrase = new Phrase(content, fontContent);
            cell.BorderWidth = borderWidth;
            cell.Padding = 5;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
        }

    }
}