using System;
using System.Collections.Generic;
using System.Text;

namespace BuilderBL.SQLDesigner.Enums
{
    /// <summary>
    /// Specifies options for grouping data.
    /// </summary>
	public enum GroupByExtension
    {
        None,
        Cube,
        Rollup,
        All
    }
}
