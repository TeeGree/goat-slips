using GoatSlips.Models.Database;
using GoatSlips.Models.Database.Query;

namespace GoatSlipsTest
{
    public sealed class TimeSlipQueryResultTest
    {
        [Theory]
        [InlineData(0, 1, 55, 0)]
        [InlineData(3, 1, 0, 3)]
        [InlineData(55, 3, 0, 165)]
        [InlineData(20, 0, 30, 10)]
        [InlineData(20.66, 3, 36, 74.38)]
        public void CostSetBasedOnRate(decimal rate, byte hours, byte minutes, decimal expectedCost)
        {
            var timeSlipQueryResult = new TimeSlipQueryResult(new TimeSlip
            {
                Hours = hours,
                Minutes = minutes
            }, rate);

            Assert.Equal(expectedCost, timeSlipQueryResult.Cost);
        }
    }
}
