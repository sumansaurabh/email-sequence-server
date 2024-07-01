import argparse
import traceback
from azure.identity import DefaultAzureCredential
from azure.mgmt.resource import ResourceManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.storage.v2021_09_01.models import StorageAccountUpdateParameters

# Acquire a credential object.
credential = DefaultAzureCredential()

def cleanup_sub(subscription_id):
    print (f"Disabling key based access for all storage accounts in sub {subscription_id}")
    storage_client = StorageManagementClient(credential, subscription_id)
    p1 = StorageAccountUpdateParameters(allow_shared_key_access=False)
    storage_accounts = storage_client.storage_accounts.list()
    cleaned = 0;
    cantclean = 0;
    cantpatchaccounts = "";
    for account in storage_accounts:
        account_name = account.name
        resource_group_name = account.id.split("/")[4]
        print(f"Updating shared access key for account {account_name}")
        try:
            storage_client.storage_accounts.update(resource_group_name, account_name, p1)
            cleaned += 1
        except:
            traceback.print_exc()
            print(f"FAILED TO UPDATE SHARED ACCESS KEY FOR ACCOUNT {account_name}.")
            cantclean += 1
            cantpatchaccounts += account_name
            cantpatchaccounts += "; "
    print(f"Patched {cleaned} accounts")
    print(f"Failed to patch {cantclean} accounts: {cantpatchaccounts}")
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', type=str, required=True, help='SubscriptionId')
    args = parser.parse_args()
    cleanup_sub(args.s)