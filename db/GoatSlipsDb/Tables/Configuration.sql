CREATE TABLE [dbo].[Configuration]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[MinutesPartition] TINYINT NOT NULL DEFAULT(1),
	[FirstDayOfWeek] TINYINT NOT NULL DEFAULT(0),
	CONSTRAINT [CK_Configuration_MinutesPartition] CHECK ([MinutesPartition] IN (1, 15, 30)),
	CONSTRAINT [CK_Configuration_FirstDayOfWeek] CHECK ([FirstDayOfWeek] IN (0, 1, 2, 3, 4, 5, 6))
)
