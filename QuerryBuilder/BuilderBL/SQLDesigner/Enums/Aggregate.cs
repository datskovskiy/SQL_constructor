using System;
using System.Collections.Generic;
using System.Text;

namespace BuilderBL.SQLDesigner.Enums
{
    /// <summary>
    /// Specifies a grouping aggregate.
    /// </summary>
    public enum Aggregate
    {
        GroupBy,
        Sum,
        Avg,
        Min,
        Max,
        Count,
        //Expression,
        //Where,
        SumDistinct,
        AvgDistinct,
        MinDistinct,
        MaxDistinct,
        CountDistinct,
        StDev,
        StDevP,
        Var,
        VarP
    }
}
