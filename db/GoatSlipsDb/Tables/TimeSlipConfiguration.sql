CREATE TABLE [dbo].[TimeSlipConfiguration]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[MinutesPartition] TINYINT NOT NULL DEFAULT(1),
	CONSTRAINT [CK_TimeSlipConfiguration_MinutesPartition] CHECK ([MinutesPartition] IN (1, 15, 30))
)
