import 'package:capital_care/controllers/providers/lead_provider.dart';
import 'package:capital_care/models/leads_model.dart';
import 'package:capital_care/views/screens/leads/lead_details_screen.dart';
import 'package:capital_care/views/widgets/app_scaffold.dart';
import 'package:capital_care/views/widgets/custom_appbar.dart';
import 'package:capital_care/views/widgets/lead_card.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class FreshLeads extends StatefulWidget {
  const FreshLeads({super.key});

  @override
  State<FreshLeads> createState() => _FreshLeadsState();
}

class _FreshLeadsState extends State<FreshLeads> {
  late Future<Map<String, dynamic>> _poolFuture;
  final TextEditingController _countController = TextEditingController(text: "10");
  bool _isAssigning = false;

  @override
  void initState() {
    super.initState();
    _poolFuture = Provider.of<LeadProvider>(
      context,
      listen: false,
    ).unassignedFreshLeadPool;
  }

  @override
  void dispose() {
    _countController.dispose();
    super.dispose();
  }

  void _refreshPool() {
    setState(() {
      _poolFuture = Provider.of<LeadProvider>(
        context,
        listen: false,
      ).unassignedFreshLeadPool;
    });
  }

  Future<void> _assignLeads(int availableCount, int maxAssignable) async {
    final requestedCount = int.tryParse(_countController.text.trim()) ?? 0;

    if (requestedCount < 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter at least 1 lead")),
      );
      return;
    }

    if (requestedCount > maxAssignable) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("You can import max $maxAssignable leads at once")),
      );
      return;
    }

    if (requestedCount > availableCount) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Only $availableCount unassigned leads available")),
      );
      return;
    }

    setState(() {
      _isAssigning = true;
    });

    try {
      final result = await Provider.of<LeadProvider>(
        context,
        listen: false,
      ).assignUnassignedFreshLeads(requestedCount);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result["message"] ?? "Leads assigned")),
      );
      _refreshPool();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString().replaceFirst("Exception: ", ""))),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isAssigning = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      appBar: CustomAppbar(title: "Unassigned Fresh Leads"),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _poolFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }

          final data = snapshot.data ?? {};
          final List<Leads> leads = data["leads"] ?? [];
          final int availableCount = data["availableCount"] ?? leads.length;
          final int maxAssignable = data["maxAssignable"] ?? 50;
          final int safeMax =
              availableCount < maxAssignable ? availableCount : maxAssignable;

          return RefreshIndicator(
            onRefresh: () async => _refreshPool(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "$availableCount leads available",
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          controller: _countController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: "How many leads do you want?",
                            helperText: "Max $maxAssignable at once",
                            border: const OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed:
                                _isAssigning || safeMax < 1
                                    ? null
                                    : () => _assignLeads(
                                      availableCount,
                                      maxAssignable,
                                    ),
                            child: Text(
                              _isAssigning
                                  ? "Importing..."
                                  : "Import Leads to My Account",
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                if (leads.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(top: 80),
                    child: Center(child: Text("No unassigned fresh leads available.")),
                  )
                else
                  ...leads.map(
                    (lead) => GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => LeadDetailsScreen(lead: lead),
                          ),
                        );
                      },
                      child: LeadCard(lead: lead),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
      isFloatingActionButton: false,
    );
  }
}
