graph = {"": {"Donation Trade": "donationTradeStarted"
              },
         "donationTradeStarted": {"Yes": "CauseSelection",
              "No": "XXXX",
              "Huh?": "XXXX"
              },
         "CauseSelection": {"Gun Rights": "CauseSelected",
              "Abortion Rights": "XXXX"
              },
         "CauseSelected": {"Very For": "AlignmentSelected",
              "Neutral": "XXXX",
              "Very Against": "XXXX"
              },
         "AlignmentSelected": {"XXXX": "XXXX"
              }
         }

// States: "", "donationTradeStarted", CauseSelection, CauseSelected, AlignmentSelected